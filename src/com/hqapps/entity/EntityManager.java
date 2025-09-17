package com.hqapps.entity;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.msg.*;
import com.hqapps.security.PasswordHandler;
import com.hqapps.util.StrUtils;

public abstract class EntityManager 
{
	static class EntityManagerImpl extends EntityManager
	{}
	
	private static EntityManager instance = 
			new EntityManagerImpl();
	
	public static EntityManager getInstance()
	{
		return instance;
	}
	
	/**
	 * Store entity kind and return external id
	 */
	public Long store ( String key, String kind, Map values )
	{
		Entity entity = null;
		if ( key != null ) {
			entity = new Entity(kind, key);
		}
		else {
			entity = new Entity(kind);
		}
		
		for (Iterator<Entry<String, Object>> it = values.entrySet().iterator(); it.hasNext(); ) {
			Entry<String, Object> entry = (Entry<String, Object>)it.next();
			if ( entry.getValue() != null ) {
				entity.setProperty(entry.getKey(), entry.getValue());
			}
		}
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(entity);
		return entity.getKey().getId();
	}
	
	/**
	 * Store Image
	 * @param key
	 * @param media
	 * @return
	 */
	public Key storeImage ( String key, Media media ) 
	{
		Entity entity = null;
		if ( key != null ) {
			entity = new Entity(media.getKind(), key);
		}
		else {
			entity = new Entity(media.getKind());
		}
		Map<String,Object> values = media.toDataMap();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		for (Iterator<Entry<String, Object>> it = values.entrySet().iterator(); it.hasNext(); ) {
			Entry<String, Object> entry = (Entry<String, Object>)it.next();
			if ( entry.getValue() != null ) {
				entity.setProperty(entry.getKey(), entry.getValue());
			}
		}
		datastore.put(entity);
		return entity.getKey();
	}
	
	/**
	 * Loads a public user object
	 * @param email
	 * @return
	 * @throws Exception
	 */
	public User getUserPublicInfo ( String email ) throws Exception
	{
		if ( email != null ) {
			Entity ent = load (  email.toLowerCase(), User.KIND );
			if ( ent != null ) {
		 		User user = new User ();
		 		Map<String,Object> props = ent.getProperties();
				user.fromDataMap(props);
				user.setAuthToken((String)props.get("salt"));
				return user;
			}
		}
		return null;
	}
	
	/**
	 * Load an entity and return Map
	 */
	public Entity load ( String key, String kind ) throws Exception
	{
		Key entityKey = KeyFactory.createKey(kind, key);
		return load (entityKey );
	}
	 
	/**
	 * Load an entity and return Map
	 */
	public Entity load ( Long key, String kind ) throws Exception
	{
		Key entityKey = KeyFactory.createKey(kind, key);
		return load (entityKey );
	}

	/**
	 * General load object of any type
	 * @param id
	 * @param objClass
	 * @return
	 * @throws Exception
	 */
	public ReqMsg loadObject ( Long id, Class objClass ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		
		Entity entity = load ( id, msg.getKind() );
		if ( entity != null ) {
			Map<String,Object> props = entity.getProperties();
			msg.fromDataMap(props);
			msg.setId(id);
			return msg;
		}
		return null;
	}
	
	/**
	 * updateObject
	 * @param id
	 * @param newData
	 * @param objClass
	 * @return the updated object
	 * @throws Exception
	 */
	public ReqMsg updateObject ( Long id, ReqMsg newData, Class objClass ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		Entity entity = load ( id, msg.getKind() );
		
		if ( entity != null ) {
			Map<String,Object> newProps = newData.toDataMap();
			
			// get new object props
			for (Iterator<Entry<String, Object>> it = newProps.entrySet().iterator(); it.hasNext(); ) {
				Entry<String, Object> newProp = (Entry<String, Object>)it.next();
				if ( newProp.getValue() != null ) {
					// set db property if there
					entity.setProperty(newProp.getKey(), newProp.getValue());
				}
			}
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			datastore.put(entity);

			msg.fromDataMap( entity.getProperties() );
			return msg;
		}
		return null;
	}
	
	/**
	 * updateComments
	 * @param id
	 * @param newData
	 * @throws Exception
	 */
	public void updateItemMaxComm ( Long id, Integer numComments ) throws Exception
	{
		Entity entity = load ( id, TTItem.KIND );
		entity.setProperty ("maxComm", numComments );
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(entity);
	}
	
	/**
	 * Delete an object from database
	 * @param id
	 * @throws Exception
	 */
	public void deleteObject ( Long id, String kind ) throws Exception
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key key = KeyFactory.createKey(kind, id);
		datastore.delete( key);
	}
	
	/**
	 * Delete entire list 
	 * @param listId
	 * @throws Exception
	 */
	public void deleteAllList ( Long listId ) throws Exception
	{
		Filter filter = new FilterPredicate("listId",FilterOperator.EQUAL, listId);
		Query q = new Query("TTItem").setFilter(filter);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			datastore.delete(result.getKey());
		}
		
		Key listKey = KeyFactory.createKey(TTList.KIND, listId);
		datastore.delete( listKey);
	}
	
	/**
	 * Load all lists
	 */
	public List<TTList> getAllLists ( String userId )
	{
		ArrayList<TTList> allLists = new ArrayList<TTList>();
		Filter filter = new FilterPredicate("userId",FilterOperator.EQUAL, userId);
		Query q = new Query("TTList").setFilter(filter);

		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			
			Map props = result.getProperties();
			TTList ttlist = new TTList ();
			ttlist.fromDataMap ( props );
			ttlist.setId(result.getKey().getId());
			allLists.add(ttlist);
		}		
		return allLists;
	}
	
	/**
	 * Load all comments for a list
	 */
	public List<Comment> getAllComments ( Long listId, Long itemId )
	{
		ArrayList<Comment> allComments = new ArrayList<Comment>();
		//Filter listFilter = new FilterPredicate("listId",FilterOperator.EQUAL, listId);
		Filter itemFilter = new FilterPredicate("itemId",FilterOperator.EQUAL, itemId);
		
		//Filter commFilter = CompositeFilterOperator.and(listFilter, itemFilter);
		Query q = new Query("Comment").setFilter(itemFilter);
		//q.addSort("modified", SortDirection.ASCENDING);
 
		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			Map props = result.getProperties();
			Comment comm = new Comment ();
			comm.fromDataMap ( props );
			comm.setId(result.getKey().getId());
			comm.setListId(null);
			comm.setItemId (null);
			allComments.add(comm);
		}		
		return allComments;
	}
	
	/**
	 * Load one list fully 
	 */
	public TTList getList ( Long listId, boolean addUser ) throws Exception
	{
		TTList retList = (TTList) loadObject ( listId, TTList.class );
		if ( retList == null ) {
			return null;	// list no longer available (if no longer exists)
		}
		if ( addUser ) {
			retList.setUser(getUserNames(retList));
		}
		
		Filter filter = new FilterPredicate("listId",FilterOperator.EQUAL, listId);
		Query q = new Query("TTItem").setFilter(filter);

		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		List<TTItem> items = new ArrayList<TTItem>();
		
		for (Entity result : pq.asIterable()) {
			
			Map props = result.getProperties();
			TTItem ttitem = new TTItem ();
			ttitem.fromDataMap ( props );
			ttitem.setId(result.getKey().getId());
			items.add(ttitem);
		}		
		if ( items.size() > 0 ) {
			retList.setItems(items);
		}
		return retList;
	}
	
	/**
	 * Gets user info
	 * @param ttlist
	 * @return
	 * @throws Exception
	 */
	public String getUserNames ( TTList ttlist ) throws Exception
	{
		User user = getUserPublicInfo (ttlist.getUserId());
		if ( user != null ) {
			return getUserNames (user);
		}
		return null;
	}
	
	/**
	 * Gets user name from user object
	 * @param ttlist
	 * @return
	 * @throws Exception
	 */
	public String getUserNames ( User user ) throws Exception
	{
		StringBuilder sb = new StringBuilder();
		if ( user != null ) {
			if ( user.getFirstName()!=null )
				sb.append(user.getFirstName()).append(" ");
			if ( user.getLastName()!=null )
				sb.append(user.getLastName());
			if ( sb.length() < 3 ) {
				sb.setLength(0);
				sb.append(user.getEmail());				
			}
			return sb.toString();
		}
		return null;
	}
	
	/**
	 * Authenticate a user and return User entity directly
	 * @param username
	 * @param password
	 * @return
	 * @throws Exception
	 */
	public User auth ( String email, String password ) 
		throws Exception 
	{
		if ( StrUtils.isEmpty(email) || StrUtils.isEmpty(password) ) 
			return null;
		
		 Entity entity = load ( email.toLowerCase(), User.KIND );
		 if ( entity != null ) {
			 // get salt from db
			 String salt = (String)entity.getProperty("salt");
			 
			 // password from DB
			 String dbpassword = (String)entity.getProperty("authToken");
			 
			 // passed password hash (with old salt)
			 String passPassword = PasswordHandler.getSecurePassword(password, salt);
			 
			 // if verifies
			 if ( dbpassword.equals(passPassword) ) {
				 User user = new User();
				 Map<String,Object> props = entity.getProperties();
				 user.fromDataMap(props);
				 return user;
			 }
		 }
		 return null;
	}

	/**
	 * Load entity by key
	 * @param entityKey
	 * @return
	 * @throws Exception
	 */
	private Entity load ( Key entityKey ) throws Exception
	{
		try {
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			return datastore.get(entityKey );
		}
		catch ( EntityNotFoundException ex) {
			return null;
		}
	}

}
