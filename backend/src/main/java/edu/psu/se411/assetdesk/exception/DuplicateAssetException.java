package edu.psu.se411.assetdesk.exception;

/** Thrown when another asset already uses the same asset tag or serial number. */
public class DuplicateAssetException extends RuntimeException {

	public DuplicateAssetException(String message) {
		super(message);
	}
}
