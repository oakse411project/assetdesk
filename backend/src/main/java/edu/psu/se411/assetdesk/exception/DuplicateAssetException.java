package edu.psu.se411.assetdesk.exception;

// Another asset uses same asset tag or serial number. 
public class DuplicateAssetException extends RuntimeException {

	public DuplicateAssetException(String message) {
		super(message);
	}
}
