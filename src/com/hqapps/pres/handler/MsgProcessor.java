package com.hqapps.pres.handler;

import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.msg.User;

public abstract class MsgProcessor 
{
	private static MsgProcessor userHandler = new UserProc();
	
	public static MsgProcessor getProcessor (  ReqMsg msg )
	{
		if ( msg instanceof User ) {
			return userHandler;
		}
		return null;
	}
	
	public abstract RespMsg process ( Method method, ReqMsg user ) 
		throws Exception;
}
