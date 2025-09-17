package com.hqapps.pres.msg;

import java.util.Map;

import com.hqapps.pres.ReqMsg;

public class Unknown extends ReqMsg
{	
	public Unknown (){
		super ("Unknown");
	}
	
	@Override
	public void fromDataMap(Map<String, Object> props) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Map<String, Object> toDataMap() {
		// TODO Auto-generated method stub
		return null;
	}
}
