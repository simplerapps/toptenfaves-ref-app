package com.hqapps.pres;

import com.google.gson.Gson;

public class RespMsg 
{	
	public enum Status {
		ERROR, OK, WARNING
	}
	
	public enum Error {
		USERNAME_EXISTS,
		AUTH_FAILURE,
		NEED_TO_AUTHENTICATE,
		NOT_FOUND
	}
	
	private Status status;
	private Error  error;
	private String message;
	private Object respData;
	private String jsessionid;
	
	private Object shareList;

	/**
	 * Success Response with payload
	 * @param status
	 * @param message
	 * @return
	 */
	public RespMsg ( Object respData )
	{
		this.status = Status.OK;
		this.respData = respData;
	}
	
	/**
	 * Response without payload issued mainly for errors
	 * @param status
	 * @param message
	 * @return
	 */
	public RespMsg ( Status status, String message )
	{
		this.status = status;
		this.message = message;
	}
	
	/**
	 * Response with payload but with flexible response (OK or ERROR)
	 * @param status
	 * @param message
	 * @return
	 */
	public RespMsg ( Status status, Error error, Object respData )
	{
		this.status = status;
		this.error = error;
		this.respData = respData;
	}
	
	/**
	 * Response without payload issued mainly for errors
	 * @param status
	 * @param message
	 * @return
	 */
	public RespMsg ( Status status, Error error, String message )
	{
		this.status = status;
		this.error = error;
		this.message = message;
	}
	
	/**
	 * convert to json string
	 * @return
	 */
	public String toJson() {
    	Gson gson = new Gson();
    	String json = gson.toJson(this);
    	return json;
    }

	public Object getRespData() {
		return respData;
	}

	public String getJsessionid() {
		return jsessionid;
	}

	public void setJsessionid(String jsessionid) {
		this.jsessionid = jsessionid;
	}
	
	public boolean isStatusOk () {
		return status == Status.OK;
	}

	public Object getShareList() {
		return shareList;
	}

	public void setShareList(Object pigBackData) {
		this.shareList = pigBackData;
	}
}
