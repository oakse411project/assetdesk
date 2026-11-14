package edu.psu.se411.assetdesk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import edu.psu.se411.assetdesk.exception.DuplicateAssetException;
import edu.psu.se411.assetdesk.exception.ObjectNotFoundException;
import edu.psu.se411.assetdesk.model.Asset;
import edu.psu.se411.assetdesk.repository.AssetRepository;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

	@Mock
	private AssetRepository assetRepository;

	@InjectMocks
	private AssetService assetService;

	private static Asset asset(Long id, String tag, String serial) {
		return new Asset(id, tag, "Laptop", "Dell", "Latitude 7440", serial, "Sara Alharbi", "Engineering",
				"Riyadh HQ", LocalDate.of(2024, 2, 11), new BigDecimal("6200.00"), LocalDate.of(2027, 2, 11),
				"In use", "");
	}


	@Test
	void getAllAssetsAsksTheRepositoryForTheRequestedPage() {
		Page<Asset> page = new PageImpl<>(List.of(asset(1L, "IT-0001", "SN-1")));
		when(assetRepository.findAll(any(Pageable.class))).thenReturn(page);

		Page<Asset> result = assetService.getAllAssets(2, 5, "brand", "desc");

		assertThat(result).isSameAs(page);
		ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
		verify(assetRepository).findAll(captor.capture());
		assertThat(captor.getValue()).isEqualTo(PageRequest.of(2, 5, Sort.by(Sort.Direction.DESC, "brand")));
	}

	@Test
	void getAllAssetsSortsAscendingByDefault() {
		when(assetRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

		assetService.getAllAssets(0, 10, "assetTag", "anything");

		ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
		verify(assetRepository).findAll(captor.capture());
		assertThat(captor.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.ASC, "assetTag"));
	}

	@Test
	void getAllAssetsRejectsAnUnknownSortField() {
		assertThatThrownBy(() -> assetService.getAllAssets(0, 10, "password", "asc"))
				.isInstanceOf(IllegalArgumentException.class);
		verify(assetRepository, never()).findAll(any(Pageable.class));
	}


	@Test
	void getAssetByIdReturnsTheAssetWhenItExists() {
		Asset existing = asset(1L, "IT-0001", "SN-1");
		when(assetRepository.findById(1L)).thenReturn(Optional.of(existing));

		assertThat(assetService.getAssetById(1L)).contains(existing);
	}

	@Test
	void getAssetByIdReturnsEmptyWhenItDoesNotExist() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThat(assetService.getAssetById(99L)).isEmpty();
	}


	@Test
	void createAssetSavesANewAsset() {
		Asset newAsset = asset(null, "IT-0016", "SN-16");
		Asset saved = asset(16L, "IT-0016", "SN-16");
		when(assetRepository.existsByAssetTag("IT-0016")).thenReturn(false);
		when(assetRepository.existsBySerialNumber("SN-16")).thenReturn(false);
		when(assetRepository.save(newAsset)).thenReturn(saved);

		assertThat(assetService.createAsset(newAsset)).isEqualTo(saved);
	}

	@Test
	void createAssetRejectsADuplicateTag() {
		when(assetRepository.existsByAssetTag("IT-0001")).thenReturn(true);

		assertThatThrownBy(() -> assetService.createAsset(asset(null, "IT-0001", "SN-NEW")))
				.isInstanceOf(DuplicateAssetException.class);
		verify(assetRepository, never()).save(any());
	}

	@Test
	void createAssetRejectsADuplicateSerialNumber() {
		when(assetRepository.existsByAssetTag("IT-0016")).thenReturn(false);
		when(assetRepository.existsBySerialNumber("SN-1")).thenReturn(true);

		assertThatThrownBy(() -> assetService.createAsset(asset(null, "IT-0016", "SN-1")))
				.isInstanceOf(DuplicateAssetException.class);
		verify(assetRepository, never()).save(any());
	}


	@Test
	void updateAssetSavesTheNewValuesUnderTheSameId() {
		when(assetRepository.findById(7L)).thenReturn(Optional.of(asset(7L, "IT-0007", "SN-7")));
		when(assetRepository.existsByAssetTagAndIdNot("IT-0007", 7L)).thenReturn(false);
		when(assetRepository.existsBySerialNumberAndIdNot("SN-7", 7L)).thenReturn(false);
		Asset changes = new Asset(null, "IT-0007", "Tablet", "Apple", "iPad Air", "SN-7", "Reem", "Sales", "",
				LocalDate.of(2024, 3, 8), new BigDecimal("2600"), LocalDate.of(2026, 11, 30), "In use", "");

		assetService.updateAsset(7L, changes);

		ArgumentCaptor<Asset> captor = ArgumentCaptor.forClass(Asset.class);
		verify(assetRepository).save(captor.capture());
		Asset saved = captor.getValue();
		assertThat(saved.id()).isEqualTo(7L);
		assertThat(saved.assignedTo()).isEqualTo("Reem");
		assertThat(saved.status()).isEqualTo("In use");
	}

	@Test
	void updateAssetThrowsWhenTheAssetDoesNotExist() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> assetService.updateAsset(99L, asset(null, "IT-0099", "SN-99")))
				.isInstanceOf(ObjectNotFoundException.class);
		verify(assetRepository, never()).save(any());
	}

	@Test
	void updateAssetRejectsATagUsedByAnotherAsset() {
		when(assetRepository.findById(7L)).thenReturn(Optional.of(asset(7L, "IT-0007", "SN-7")));
		when(assetRepository.existsByAssetTagAndIdNot("IT-0001", 7L)).thenReturn(true);

		assertThatThrownBy(() -> assetService.updateAsset(7L, asset(null, "IT-0001", "SN-7")))
				.isInstanceOf(DuplicateAssetException.class);
		verify(assetRepository, never()).save(any());
	}

	@Test
	void updateAssetRejectsASerialNumberUsedByAnotherAsset() {
		when(assetRepository.findById(7L)).thenReturn(Optional.of(asset(7L, "IT-0007", "SN-7")));
		when(assetRepository.existsByAssetTagAndIdNot("IT-0007", 7L)).thenReturn(false);
		when(assetRepository.existsBySerialNumberAndIdNot("SN-1", 7L)).thenReturn(true);

		assertThatThrownBy(() -> assetService.updateAsset(7L, asset(null, "IT-0007", "SN-1")))
				.isInstanceOf(DuplicateAssetException.class);
		verify(assetRepository, never()).save(any());
	}


	@Test
	void deleteAssetDeletesAnExistingAsset() {
		when(assetRepository.findById(5L)).thenReturn(Optional.of(asset(5L, "IT-0005", "SN-5")));

		assetService.deleteAsset(5L);

		verify(assetRepository).deleteById(5L);
	}

	@Test
	void deleteAssetThrowsWhenTheAssetDoesNotExist() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> assetService.deleteAsset(99L)).isInstanceOf(ObjectNotFoundException.class);
		verify(assetRepository, never()).deleteById(anyLong());
	}
}
