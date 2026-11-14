package edu.psu.se411.assetdesk;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Runs the whole server (controller + service + repository + H2 with data.sql)
 * to check that the layers work together. Each test gets a fresh database.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AssetApiIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	private static final String NEW_ASSET = """
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

	@Test
	void listsTheSeededAssetsOnePageAtATime() throws Exception {
		mockMvc.perform(get("/api/v1/assets?page=1&size=10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(5))
				.andExpect(jsonPath("$.content[0].assetTag").value("IT-0011"))
				.andExpect(jsonPath("$.page.totalElements").value(15))
				.andExpect(jsonPath("$.page.totalPages").value(2));
	}

	@Test
	void sortsDescending() throws Exception {
		mockMvc.perform(get("/api/v1/assets?sort=assetTag&dir=desc&size=1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].assetTag").value("IT-0015"));
	}

	@Test
	void findsAnAssetById() throws Exception {
		mockMvc.perform(get("/api/v1/assets/8"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.model").value("PowerEdge R760"))
				.andExpect(jsonPath("$.purchaseCost").value(48500.00));
	}

	@Test
	void addsAnAssetThenFindsItAtTheReturnedLocation() throws Exception {
		String location = mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(NEW_ASSET))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", "http://localhost/api/v1/assets/16"))
				.andReturn().getResponse().getHeader("Location");

		mockMvc.perform(get(location))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.assetTag").value("IT-0016"))
				.andExpect(jsonPath("$.model").value("ThinkPad T14"));
	}

	@Test
	void rejectsADuplicateSerialNumber() throws Exception {
		String duplicate = NEW_ASSET.replace("PF-NEW-001", "DL7440-8K2M1");

		mockMvc.perform(post("/api/v1/assets").contentType(MediaType.APPLICATION_JSON).content(duplicate))
				.andExpect(status().isConflict());
	}

	@Test
	void updatesAnAsset() throws Exception {
		String changes = NEW_ASSET.replace("IT-0016", "IT-0007").replace("In storage", "In use")
				.replace("\"assignedTo\": \"\"", "\"assignedTo\": \"Reem Alfaisal\"");

		mockMvc.perform(put("/api/v1/assets/7").contentType(MediaType.APPLICATION_JSON).content(changes))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/v1/assets/7"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.assignedTo").value("Reem Alfaisal"))
				.andExpect(jsonPath("$.status").value("In use"));
	}

	@Test
	void updatingAnUnknownAssetReturnsNotFound() throws Exception {
		mockMvc.perform(put("/api/v1/assets/999").contentType(MediaType.APPLICATION_JSON).content(NEW_ASSET))
				.andExpect(status().isNotFound());
	}

	@Test
	void deletesAnAsset() throws Exception {
		mockMvc.perform(delete("/api/v1/assets/11"))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/v1/assets/11"))
				.andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/assets"))
				.andExpect(jsonPath("$.page.totalElements").value(14));
	}
}
