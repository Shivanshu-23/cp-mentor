package com.cpmentor.worksheet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorksheetSaveRequest {

    @NotBlank
    private String fileName;

    @NotBlank
    private String markdown;

    @NotBlank
    private String problem;

    // Optional — not every worksheet has an LC number or a chosen difficulty yet.
    private String lcNumber;
    private String difficulty;
}
