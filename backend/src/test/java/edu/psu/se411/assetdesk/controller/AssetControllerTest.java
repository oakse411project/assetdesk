package edu.psu.se411.assetdesk.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import edu.psu.se411.assetdesk.exception.DuplicateAssetException;
import edu.psu.se411.assetdesk.exception.ObjectNotFoundException;
import edu.psu.se411.assetdesk.model.Asset;
import edu.psu.se411.assetdesk.service.AssetService;

@WebMvcTest(AssetController.class)
class AssetControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AssetService assetService;

	private static Asset asset(Long id) {
		return new Asset(id, "IT-0001", "Laptop", "Dell", "Latitude 7440", "DL7440-8K2M1", "Sara Alharbi",
				"Engineering", "Riyadh HQ", LocalDate.of(2024, 2, 11), new BigDecimal("6200.00"),
				LocalDate.of(2027, 2, 11), "In use", "");
	}

	private static final String VALID_JSON = """
			{
			  "assetTag": "IT-0016",
			  "category": "Laptop",
			  "brand": "Lenovo",
			  "model": "ThinkPad T14",
			  "serialNumber": "PF-NEW-001",
			  "assignedTo": "",
			  "department": "Finance",
			  "location": "",
			  "purchaseDate": "2026-10-01",
			  "purchaseCost": 5200,
			  "warrantyExpiry": "2029-10-01",
			  "status": "In storage",
			  "notes": ""
			}
			""";

	private static String jsonWithId() {
		return VALID_JSON.replace("{", "{ \"id\": 5,");
	}


	@Test
	void getAllAssetsReturnsAPageOfAssets() throws Exception {
		when(assetService.getAllAssets(0, 10, "assetTag", "asc"))
				.thenReturn(new PageImpl<>(List.of(asset(1L)), PageRequest.of(0, 10), 15));

		mockMvc.perform(get("/api/v1/assets"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(1))
				.andExpect(jsonPath("$.content[0].assetTag").value("IT-0001"))
				.andExpect(jsonPath("$.content[0].purchaseDate").value("2024-02-11"))
				.andExpect(jsonPath("$.page.number").value(0))
				.andExpect(jsonPath("$.page.size").value(10))
				.andExpect(jsonPath("$.page.totalElements").value(15))
				.andExpect(jsonPath("$.page.totalPages").value(2));
	}

	@Test
	void getAllAssetsPassesPagingParametersToTheService() throws Exception {
		when(assetService.getAllAssets(1, 5, "brand", "desc"))
				.thenReturn(new PageImpl<>(List.of(), PageRequest.of(1, 5), 0));

		mockMvc.perform(get("/api/v1/assets?page=1&size=5&sort=brand&dir=desc"))
				.andExpect(status().isOk());

		verify(assetService).getAllAssets(1, 5, "brand", "desc");
	}

	@Test
	void getAllAssetsReturnsBadRequestForAnUnknownSortField() throws Exception {
		when(assetService.getAllAssets(anyInt(), anyInt(), eq("password"), anyString()))
				.thenThrow(new IllegalArgumentException("Cannot sort by password"));

		mockMvc.perform(get("/api/v1/assets?sort=password"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void getAllAssetsReturnsBadRequestForAnInvalidPageSize() throws Exception {
		mockMvc.perform(get("/api/v1/assets?size=0"))
				.andExpect(status().isBadRequest());
		verifyNoInteractions(assetService);
	}


	@Test
	void getAssetByIdReturnsTheAsset() throws Exception {
		when(assetService.getAssetById(1L)).thenReturn(Optional.of(asset(1L)));

		mockMvc.perform(get("/api/v1/assets/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.brand").value("Dell"))
				.andExpect(jsonPath("$.serialNumber").value("DL7440-8K2M1"));
	}

	@Test
	void getAssetByIdReturnsNotFoundForAnUnknownId() throws Exception {
		when(assetService.getAssetById(99L)).thenReturn(Optional.empty());

		mockMvc.perform(get("/api/v1/assets/99"))
				.andExpect(status().isNotFound());
	}

	@Test
	void getAssetByIdReturnsBadRequestForANegativeId() throws Exception {
		mockMvc.perform(get("/api/v1/assets/-1"))
				.andExpect(status().isBadRequest());
		verifyNoInteractions(assetService);
	}


	@Test
	void createAssetReturnsCreatedWithTheLocationOfTheNewAsset() throws Exception {
		when(assetService.createAsset(any(Asset.class))).thenReturn(asset(16L));

		mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", "http://localhost/api/v1/assets/16"));
	}

	@Test
	void createAssetReturnsBadRequestWhenTheBodyHasAnId() throws Exception {
		mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(jsonWithId()))
				.andExpect(status().isBadRequest());
		verify(assetService, never()).createAsset(any());
	}

	@Test
	void createAssetReturnsBadRequestForInvalidData() throws Exception {
		String invalid = VALID_JSON.replace("\"IT-0016\"", "\"BAD-TAG\"").replace("\"Lenovo\"", "\"\"");

		mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(invalid))
				.andExpect(status().isBadRequest());
		verify(assetService, never()).createAsset(any());
	}

	@Test
	void createAssetReturnsConflictForADuplicate() throws Exception {
		when(assetService.createAsset(any(Asset.class)))
				.thenThrow(new DuplicateAssetException("Another asset already uses this tag"));

		mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isConflict());
	}


	@Test
	void updateAssetReturnsNoContent() throws Exception {
		mockMvc.perform(put("/api/v1/assets/7").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isNoContent());
		verify(assetService).updateAsset(eq(7L), any(Asset.class));
	}

	@Test
	void updateAssetReturnsNotFoundForAnUnknownId() throws Exception {
		doThrow(new ObjectNotFoundException("Asset Not Found")).when(assetService).updateAsset(eq(99L), any(Asset.class));

		mockMvc.perform(put("/api/v1/assets/99").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	void updateAssetReturnsBadRequestWhenTheBodyHasAnId() throws Exception {
		mockMvc.perform(put("/api/v1/assets/7").contentType(MediaType.APPLICATION_JSON).content(jsonWithId()))
				.andExpect(status().isBadRequest());
		verify(assetService, never()).updateAsset(any(), any());
	}

	@Test
	void updateAssetReturnsBadRequestForInvalidData() throws Exception {
		String invalid = VALID_JSON.replace("5200", "-1");

		mockMvc.perform(put("/api/v1/assets/7").contentType(MediaType.APPLICATION_JSON).content(invalid))
				.andExpect(status().isBadRequest());
		verify(assetService, never()).updateAsset(any(), any());
	}

	@Test
	void updateAssetReturnsConflictForADuplicate() throws Exception {
		doThrow(new DuplicateAssetException("Another asset already has this serial number"))
				.when(assetService).updateAsset(eq(7L), any(Asset.class));

		mockMvc.perform(put("/api/v1/assets/7").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isConflict());
	}


	@Test
	void deleteAssetReturnsNoContent() throws Exception {
		mockMvc.perform(delete("/api/v1/assets/5"))
				.andExpect(status().isNoContent());
		verify(assetService).deleteAsset(5L);
	}

	@Test
	void deleteAssetReturnsNotFoundForAnUnknownId() throws Exception {
		doThrow(new ObjectNotFoundException("Asset Not Found")).when(assetService).deleteAsset(99L);

		mockMvc.perform(delete("/api/v1/assets/99"))
				.andExpect(status().isNotFound());
	}


	@Test
	void allowsTheReactDevServerAndExposesLocation() throws Exception {
		when(assetService.createAsset(any(Asset.class))).thenReturn(asset(16L));

		mockMvc.perform(post("/api/v1/assets").header("Origin", "http://localhost:5173")
				.contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
				.andExpect(status().isCreated())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
				.andExpect(header().string("Access-Control-Expose-Headers", "Location"));
	}
}
