package com.hqapps.util;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.logging.Logger;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.google.appengine.api.images.Image;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.OutputSettings;
import com.google.appengine.api.images.Transform;

public class ImageUtils 
{
	private static final Logger log = Logger.getLogger(ImageUtils.class.getName());	
	
	/**
	 * Resize the image
	 * @param imgData
	 * @return
	 */
	public static byte [] resizeImage ( byte [] imgData )
	{
		float factor = (1000000F /  (float)imgData.length) - 0.1F;  
		
		ImagesService imagesService = ImagesServiceFactory.getImagesService();
		
		int orientation = getEXIFOrientation (imgData );
	
		Image oldImg = ImagesServiceFactory.makeImage(imgData);
		oldImg.getFormat();
		
		int w = (int) ((float)oldImg.getWidth() * factor);
		int h = (int) ((float)oldImg.getHeight()* factor);
		if ( w > 800 ) {
			w = 700;
			h = 450;
		}
    	
	    Transform resize = ImagesServiceFactory.makeResize( w, h );
	
	    Image newImage = imagesService.applyTransform(resize, oldImg);
	
	    byte[] newImageData = newImage.getImageData();
	    
	    // fix image orientation (sometimes it is rotated from mobile device)
	    byte[] genImageData = fixOrientation ( orientation, newImageData );
	    
	    return genImageData;  
	}
	
	/**
	 * Fix image orientation
	 * @param bytes
	 * @return fixed image bytes
	 */
	public static byte[] fixOrientation ( int orientation, byte[] bytes) 
	{
		byte[] result = bytes;
		int degrees = -1;
		if (orientation == 3) {
			degrees = 180;
		}
		else if (orientation == 6) {
			degrees = 90;
		}
		else if (orientation == 8) {
			degrees = -90;
		}
		if (degrees != -1) {
			log.warning("Fixed image rotated orientation: " + orientation );
			Image img = ImagesServiceFactory.makeImage(bytes);
			Transform rotation = ImagesServiceFactory.makeRotate(degrees);
			// GAE changes output format from JPEG to PNG while rotating the
			// image if the expected output format is not given:
			OutputSettings settings = new OutputSettings(ImagesService.OutputEncoding.JPEG);
			settings.setQuality(100);
			img = ImagesServiceFactory.getImagesService().applyTransform(rotation, img, settings);
			result = img.getImageData();
		}
		return result;
	}
	
	/**
	 * Get Image orientation code
	 * @param bytes
	 * @return
	 */
	public static int getEXIFOrientation (byte[] bytes) 
	{
		int orientation = -1; // default = unknown
		ByteArrayInputStream bis = null;    
		try {
			bis = new ByteArrayInputStream(bytes);
			Metadata metadata = ImageMetadataReader.readMetadata(new BufferedInputStream(bis));
			ExifIFD0Directory exifDir = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
			if (exifDir != null) {
				orientation = exifDir.getInt(274); // 274 is the EXIF -- orientation standard code
			}
		} 
		catch (Exception e) {
			log.warning("Couldn't extract EXIF orientation from image");
		} 
		finally {
			if (bis != null) {
				try {
					bis.close();
				} 
				catch (IOException e) {}
			}
		}
		return orientation;
	}
}
