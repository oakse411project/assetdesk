package edu.psu.se411.assetdesk.controller;

import java.net.URI;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

import edu.psu.se411.assetdesk.exception.DuplicateAssetException;
import edu.psu.se411.assetdesk.exception.ObjectNotFoundException;
import edu.psu.se411.assetdesk.model.Asset;
import edu.psu.se411.assetdesk.service.AssetService;

@RestController
@RequestMapping("/api/v1/assets")
// The React app runs on the Vite dev server (port 5173). Location is exposed so it can read the id of a new asset.
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Location")
public class AssetController {

	private AssetService assetService;

	public AssetController(AssetService assetService) {
		this.assetService = assetService;
	}

	@GetMapping()
	public ResponseEntity<PagedModel<Asset>> getAllAssets(
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "10") @Min(1) @Max(1000) int size,
			@RequestParam(defaultValue = "assetTag") String sort,
			@RequestParam(defaultValue = "asc") String dir) {
		try {
			Page<Asset> assets = assetService.getAllAssets(page, size, sort, dir);
			return ResponseEntity.ok(new PagedModel<>(assets));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<Asset> getAssetById(@PathVariable @Positive Long id) {
		Optional<Asset> op = assetService.getAssetById(id);
		if (op.isPresent()) {
			return ResponseEntity.ok(op.get());
		}
		return ResponseEntity.notFound().build();
	}

	@PostMapping
	public ResponseEntity<Void> createAsset(@Valid @RequestBody Asset asset, UriComponentsBuilder ucb) {
		if (asset.id() != null) {
			return ResponseEntity.badRequest().build();
		}
		try {
			Asset createdAsset = assetService.createAsset(asset);
			URI uri = ucb.path("/api/v1/assets/{id}").buildAndExpand(createdAsset.id()).toUri();
			return ResponseEntity.created(uri).build();
		} catch (DuplicateAssetException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<Void> updateAsset(@PathVariable @Positive Long id, @Valid @RequestBody Asset asset) {
		if (asset.id() != null) {
			return ResponseEntity.badRequest().build();
		}
		try {
			assetService.updateAsset(id, asset);
			return ResponseEntity.noContent().build();
		} catch (ObjectNotFoundException e) {
			return ResponseEntity.notFound().build();
		} catch (DuplicateAssetException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteAsset(@PathVariable @Positive Long id) {
		try {
			assetService.deleteAsset(id);
			return ResponseEntity.noContent().build();
		} catch (ObjectNotFoundException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
