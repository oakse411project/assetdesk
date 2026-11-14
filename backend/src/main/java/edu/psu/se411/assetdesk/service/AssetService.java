package edu.psu.se411.assetdesk.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import edu.psu.se411.assetdesk.exception.DuplicateAssetException;
import edu.psu.se411.assetdesk.exception.ObjectNotFoundException;
import edu.psu.se411.assetdesk.model.Asset;
import edu.psu.se411.assetdesk.repository.AssetRepository;

@Service
public class AssetService {

	// Only these fields can be used to sort the list (they are the list's columns).
	public static final Set<String> SORT_FIELDS = Set.of("id", "assetTag", "brand", "assignedTo", "status", "warrantyExpiry");

	private AssetRepository assetRepository;

	public AssetService(AssetRepository assetRepository) {
		this.assetRepository = assetRepository;
	}

	public Page<Asset> getAllAssets(int page, int size, String sort, String dir) {
		if (!SORT_FIELDS.contains(sort)) {
			throw new IllegalArgumentException("Cannot sort by " + sort);
		}
		Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
		return assetRepository.findAll(PageRequest.of(page, size, Sort.by(direction, sort)));
	}

	public Optional<Asset> getAssetById(Long id) {
		return assetRepository.findById(id);
	}

	public Asset createAsset(Asset asset) {
		if (assetRepository.existsByAssetTag(asset.assetTag())) {
			throw new DuplicateAssetException("Another asset already uses this tag");
		}
		if (assetRepository.existsBySerialNumber(asset.serialNumber())) {
			throw new DuplicateAssetException("Another asset already has this serial number");
		}
		return assetRepository.save(asset);
	}

	public void updateAsset(Long id, Asset asset) {
		Asset existingAsset = assetRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException("Asset Not Found"));
		if (assetRepository.existsByAssetTagAndIdNot(asset.assetTag(), existingAsset.id())) {
			throw new DuplicateAssetException("Another asset already uses this tag");
		}
		if (assetRepository.existsBySerialNumberAndIdNot(asset.serialNumber(), existingAsset.id())) {
			throw new DuplicateAssetException("Another asset already has this serial number");
		}
		Asset updatedAsset = new Asset(id, asset.assetTag(), asset.category(), asset.brand(), asset.model(),
				asset.serialNumber(), asset.assignedTo(), asset.department(), asset.location(),
				asset.purchaseDate(), asset.purchaseCost(), asset.warrantyExpiry(), asset.status(), asset.notes());
		assetRepository.save(updatedAsset);
	}

	public void deleteAsset(Long id) {
		Asset existingAsset = assetRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException("Asset Not Found"));
		assetRepository.deleteById(existingAsset.id());
	}
}
