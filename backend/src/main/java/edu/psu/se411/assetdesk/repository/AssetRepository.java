package edu.psu.se411.assetdesk.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import edu.psu.se411.assetdesk.model.Asset;

@Repository
public interface AssetRepository extends CrudRepository<Asset, Long>, PagingAndSortingRepository<Asset, Long> {

	// Used to stop two assets from sharing a tag or a serial number.
	boolean existsByAssetTag(String assetTag);

	boolean existsBySerialNumber(String serialNumber);

	// Same checks for an update, ignoring the asset being updated.
	boolean existsByAssetTagAndIdNot(String assetTag, Long id);

	boolean existsBySerialNumberAndIdNot(String serialNumber, Long id);
}
