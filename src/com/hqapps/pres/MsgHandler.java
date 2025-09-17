package com.hqapps.pres;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.hqapps.entity.EntityManager;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.handler.MsgProcessor;
import com.hqapps.pres.msg.Follow;
import com.hqapps.pres.msg.TTItem;
import com.hqapps.pres.msg.TTList;
import com.hqapps.pres.msg.Unknown;
import com.hqapps.pres.msg.User;
import com.hqapps.pres.msg.Comment;
import com.hqapps.pres.msg.Feedback;
import com.hqapps.security.PassReset;
import com.hqapps.security.PasswordHandler;
import com.hqapps.util.ReqUtils;
import com.hqapps.util.StrUtils;

public abstract class MsgHandler 
{
	private static final String AUTH_USER_ID = "authUserId";
	
	static class MsgHandlerImpl extends MsgHandler 
	{}
	
	private static MsgHandler instance = new MsgHandlerImpl();
	
	private MsgHandler()
	{}
	
	public static MsgHandler getInstance ()
	{
		return instance;
	}
	
	/**
	 * Main message processor method
	 * @param method
	 * @param msg
	 * @param req
	 * @return
	 * @throws Exception
	 */
	public RespMsg process ( Method method, ReqMsg msg, HttpServletRequest req ) 
			throws Exception   
	{
		RespMsg resp = null;
		
		// get session and create if does not exist
		HttpSession session = req.getSession(true);

		// USER: handle user msg no matter what 
		if ( msg instanceof User ) {
			//resp =  handleMsg ( method, (User) msg );
			resp = MsgProcessor.getProcessor( msg ).process(method, (User) msg);
			if ( resp.getRespData()!=null &&  resp.getRespData() instanceof User) {
				User user = (User)resp.getRespData();
				
				//  if user authenticated, add him to session
				if ( user.getEmail() != null ) {
					session.putValue (AUTH_USER_ID, user.getEmail() );
					resp.setJsessionid(session.getId());
				}
			}
			return resp;
		}

		// get session variable (indication of user logged in)
		String userId = (String)session.getAttribute(AUTH_USER_ID);
		
		// USER NOT AUTHENTICATED
		if ( userId == null ) {
			resp = new RespMsg(Status.ERROR, Error.NEED_TO_AUTHENTICATE, "Please authenticate") ;
			
			// PUBLIC ACCESS: follow list check 
			if ( msg instanceof TTList ) {
				RespMsg fresp = handleFollowMsg ( method, ((TTList)msg).getFId(), null, null ); 
				if ( fresp!=null && fresp.isStatusOk() ) {
					resp.setShareList(fresp);
				}
			}
			// PUBLIC ACCESS: feedback send me reset link
			else if ( msg instanceof Feedback) {
				Feedback fmsg = (Feedback)msg; 
				// special case for feedback msg == "EMAIL-ME-RESET-PASSWORD" to send reset password link
				if ( fmsg.getMsg() != null && fmsg.getUserId() != null ) {
					if ( fmsg.getMsg().equals("EMAIL-ME-RESET-PASSWORD" ) ) {
						User uinfo = EntityManager.getInstance().getUserPublicInfo(fmsg.getUserId());
						if ( uinfo != null ) {
							PassReset.sendResetEmail (req, uinfo );
						}
					}
					// if user is not in the system, ignore 
				}
			}
			return resp;
		}		
		
		// USER AUTHENTICATED
		// Handle multi-part messages
		msg = ReqUtils.processMPartMessage ( req, msg ); 
		
		if ( msg instanceof TTList ) {
			resp = handleMsg ( method, (TTList) msg, userId );
			RespMsg fresp = handleFollowMsg ( method, ((TTList)msg).getFId(), null, resp); 
			if ( fresp!=null && fresp.isStatusOk() ) {
				resp.setShareList(fresp);
			}
		}
		else if ( msg instanceof TTItem ) {
			return handleMsg ( method, (TTItem) msg, userId );
		}
		else if ( msg instanceof Comment ) {
			return handleMsg ( method, (Comment) msg, userId );
		}
		else if ( msg instanceof Feedback ) {
			return handleMsg ( method, (Feedback) msg, userId );
		}
		else if ( msg instanceof Unknown ) {
			return handleMsg ( method, (Unknown) msg );
		}
		
		// invalid request
		if ( resp == null ) {
			resp = new RespMsg(Status.ERROR, "Message not supported") ;
		}
		return resp;
	}
	
	/// ALL Messages Processed Here
	
	/**
	 * handle follow message
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleFollowMsg ( Method method, Long followId, String userId, 
			RespMsg ttlistGetResp ) throws Exception
	{
		if ( followId == null )
			return null;

		// check if list has been shared already
		if ( ttlistGetResp != null ) {
			Object respData = ttlistGetResp.getRespData();
			if ( !(respData instanceof List) ) 
				return null;
			List<TTList> lists = (List<TTList>)respData;
			if ( lists != null ) {
				for ( TTList ttl : lists ) {
					if ( ttl.getFId()!=null && 
							ttl.getFId().equals(followId) ) {
						return null;
					}
				}
			}
		}
		
		EntityManager em = EntityManager.getInstance();
		String errMsg = "Missing id or not Found" ;
		
		// Read single ttlist with all its children 
		if ( method == Method.GET ) {
			// no id, get all
			TTList ttlist = em.getList(followId, true);
			if ( ttlist == null ) {
				errMsg = "Cannot find followId: " + followId + ", or userId: " + ttlist.getUserId();
			}
			else {
				Follow fol = new Follow ();
				fol.setId(followId);
				fol.setList(ttlist);
				return new RespMsg (fol);
			}
		}
		
		// method not supported
		return new RespMsg (Status.ERROR, errMsg  );
	}
	
	/**
	 * handle User resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, TTList ttlist, String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read single ttlist with all its children 
		if ( method == Method.GET ) {
			// no id, get all lists
			if ( ttlist.getId() == null ) {
				List <TTList> allLists = em.getAllLists(userId);
				StrUtils.sortTTList( allLists );
				return new RespMsg ( allLists );
			}
			else if ( ttlist.getId() != null  ) {
				TTList list = null;
				// if fId != null, then get shared list 
				if ( ttlist.getFId() != null ) {
					Long id = ttlist.getId();
					Long fId = ttlist.getFId();
					list = em.getList(fId, true);	
					if ( list != null ) { 
						list.setFId(fId);
						list.setId(id);						
					}
					else { // return warning, list no longer exists
						list = em.getList(ttlist.getId(), false);
						User fuser = em.getUserPublicInfo(list.getfUserId());
						String names = em.getUserNames(fuser);
						ttlist.setUser(names);
						ttlist.setfUserId(list.getfUserId());
						return new RespMsg (Status.WARNING, Error.NOT_FOUND, ttlist );
					}
				}
				// get my list
				else {
					list = em.getList(ttlist.getId(), false);			
				}
				return new RespMsg ( list ); 
			}
			else {
				ReqMsg msg = em.loadObject(ttlist.getId(), TTList.class);
				if ( msg == null ) {
					return new RespMsg (Status.ERROR, "Not Found"  );
				}
				return new RespMsg ( msg );
			}
		}
		// update TTList
		else if ( method == Method.PUT ) {
			if ( ttlist.getId() != null ) {
				ttlist.setModified(new Date());
				ReqMsg msg = em.updateObject ( ttlist.getId(), ttlist, TTList.class );
				return new RespMsg ( msg  );
			}
			else {
				return new RespMsg (Status.ERROR, "Missing id or not Found"  );
			}
		}
		
		// Save object (one by one)
		else if ( method == Method.POST ) {
			ttlist.setUserId(userId);
			ttlist.setModified(new Date());
			Map<String,Object> values = ttlist.toDataMap();
			Long id = em.store(null, TTList.KIND, values);
			ttlist.setId(id);
		}
		
		// Delete TTList
		else if ( method == Method.DELETE ) {
			if ( ttlist.getId() != null ) {
				em.deleteAllList (ttlist.getId() );
				return new RespMsg (ttlist );
			}
		}
		
		// method not supported
		return new RespMsg ( ttlist  );
	}
	
	/**
	 * handle User resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, TTItem ttItem, String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read object 
		if ( method == Method.GET ) {
			if ( ttItem.getId() != null ) {
				ReqMsg msg = em.loadObject(ttItem.getId(), TTItem.class);
				if ( msg != null ) {
					return new RespMsg ( msg );
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			ttItem.setModified(new Date());
			Map<String,Object> values = ttItem.toDataMap();
			Long id = em.store(null, TTItem.KIND, values);
			ttItem.setId(id);
			
			// return new 
			return new RespMsg ( ttItem  );
		}
		// Update object
		else if ( method == Method.PUT ) {
			if ( ttItem.getId() != null ) {
				ttItem.setModified(new Date());
				ReqMsg msg = em.updateObject ( ttItem.getId(), ttItem, TTItem.class );
				return new RespMsg ( msg  );
			}
		}
		// Delete object
		else if ( method == Method.DELETE ) {
			if ( ttItem.getId() != null ) {
				em.deleteObject(ttItem.getId(), TTItem.KIND);
				return new RespMsg (ttItem );
			}
		}
		return new RespMsg (Status.ERROR, "Missing id or not Found"  );
	}
	
	/**
	 * handle Comment resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Comment comment, String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read object 
		if ( method == Method.GET ) {
			if ( comment.getId() != null ) {
				ReqMsg msg = em.loadObject(comment.getId(), Comment.class);
				if ( msg != null ) {
					return new RespMsg ( msg );
				}
			}
			else if ( comment.getItemId()!=null && comment.getListId()!=null ) {
				List <Comment> allComm = em.getAllComments(comment.getListId(), 
						comment.getItemId());
				if ( allComm.size() > 0 ) {
					//NO need to sort in memory: we do this as part of query
					StrUtils.sortComments (allComm);
					return new RespMsg (allComm);
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			if ( comment.getListId()==null || comment.getItemId()==null ) {
				new RespMsg (Status.ERROR, "You need both listId and itemId"  );
			}
			comment.setModified(new Date());
			comment.setUserId(userId);
			Map<String,Object> values = comment.toDataMap();
			Long id = em.store(null, Comment.KIND, values);
			comment.setId(id);
			
			if ( comment.getMaxComm() != null ) {
				// update TTList max comments
				em.updateItemMaxComm ( comment.getItemId(), comment.getMaxComm() );
			}
			
			// return new 
			return new RespMsg ( comment  );
		}
		// Update object
		else if ( method == Method.PUT ) {
			if ( comment.getId() != null ) {
				comment.setModified(new Date() );
				ReqMsg msg = em.updateObject ( comment.getId(), comment, Comment.class );
				return new RespMsg ( msg  );
			}
		}
		// Delete object
		else if ( method == Method.DELETE ) {
			if ( comment.getId() != null ) {
				em.deleteObject(comment.getId(), Comment.KIND);
				return new RespMsg (comment );
			}
		}
		return new RespMsg (Status.ERROR, "Missing id or not Found"  );
	}
	
	
	/**
	 * handle Comment resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Feedback feedback, String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read object 
		if ( method == Method.GET ) {
			if ( feedback.getId() != null ) {
				ReqMsg msg = em.loadObject(feedback.getId(), Feedback.class);
				if ( msg != null ) {
					return new RespMsg ( msg );
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			feedback.setModified(new Date());
			feedback.setUserId(userId);
			Map<String,Object> values = feedback.toDataMap();
			Long id = em.store(null, Feedback.KIND, values);
			feedback.setId(id);

			// return new 
			return new RespMsg ( feedback  );
		}
		// Update object
		else if ( method == Method.PUT ) {
		}
		// Delete object
		else if ( method == Method.DELETE ) {
		}
		return new RespMsg (Status.ERROR, "Missing id or not Found"  );
	}
	
	/**
	 * Handle unknown resource message
	 * @param method
	 * @param msg
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Unknown msg )
	{
		RespMsg resp = new RespMsg (Status.ERROR, "Resource not found: " + msg.getResource() );
		return resp;
	}
	

}
