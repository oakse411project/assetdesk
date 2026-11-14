package edu.psu.se411.assetdesk.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import edu.psu.se411.assetdesk.model.Asset;

@Repository
public interface AssetRepository extends CrudRepository<Asset, Long>, PagingAndSortingRepository<Asset, Long> {

	boolean existsByAssetTag(String assetTag);

	boolean existsBySerialNumber(String serialNumber);

	boolean existsByAssetTagAndIdNot(String assetTag, Long id);

	boolean existsBySerialNumberAndIdNot(String serialNumber, Long id);
}
