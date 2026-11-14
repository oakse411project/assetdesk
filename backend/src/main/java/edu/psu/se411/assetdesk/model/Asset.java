package edu.psu.se411.assetdesk.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record Asset (
		@Id
		@PositiveOrZero(message = "id cannot be negative")
		Long id,

		@NotBlank(message = "assetTag cannot be empty")
		@Pattern(regexp = "IT-\\d{4,}", message = "assetTag must look like IT-0001")
		String assetTag,

		@NotBlank(message = "category cannot be empty")
		String category,

		@NotBlank(message = "brand cannot be empty")
		@Size(max = 60, message = "brand must be at most 60 characters")
		String brand,

		@NotBlank(message = "model cannot be empty")
		@Size(max = 60, message = "model must be at most 60 characters")
		String model,

		@NotBlank(message = "serialNumber cannot be empty")
		@Pattern(regexp = "[A-Za-z0-9-]+", message = "serialNumber can only contain letters, numbers and dashes")
		String serialNumber,

		@Size(max = 60, message = "assignedTo must be at most 60 characters")
		String assignedTo,

		@NotBlank(message = "department cannot be empty")
		String department,

		@Size(max = 60, message = "location must be at most 60 characters")
		String location,

		@NotNull(message = "purchaseDate is required")
		LocalDate purchaseDate,

		@NotNull(message = "purchaseCost is required")
		@PositiveOrZero(message = "purchaseCost cannot be negative")
		BigDecimal purchaseCost,

		@NotNull(message = "warrantyExpiry is required")
		LocalDate warrantyExpiry,

		@NotBlank(message = "status cannot be empty")
		String status,

		@Size(max = 500, message = "notes must be at most 500 characters")
		String notes
) {}
