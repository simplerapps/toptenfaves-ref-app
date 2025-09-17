package com.hqapps.util;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.hqapps.pres.msg.Comment;
import com.hqapps.pres.msg.TTList;

public class StrUtils 
{
	public static boolean isEmpty ( String str )
	{
		return str==null || str.trim().length()==0;
	}
	
	public static void sortTTList ( List<TTList> ttlist ) 
	{
		Collections.sort(ttlist, new Comparator<TTList>() {
			@Override
			public int compare(TTList o1, TTList o2) {
				if ( o1.getModified()!=null && o2.getModified()!=null ) {
					return o1.getModified().compareTo ( o2.getModified() );
				}
				return 0;
			}
	    });
	}
	
	public static void sortComments ( List<Comment> commList ) 
	{
		Collections.sort(commList, new Comparator<Comment>() {
			int result = 0;
			
			@Override
			public int compare(Comment o1, Comment o2) {
				if ( o1.getModified()!=null && o2.getModified()!=null ) {
					result = o1.getModified().compareTo ( o2.getModified() );
				}
				System.out.println (o1.getModified() + " == " + o2.getModified() + " ===> " + result );				
				return result;
			}
	    });
	}	
}
