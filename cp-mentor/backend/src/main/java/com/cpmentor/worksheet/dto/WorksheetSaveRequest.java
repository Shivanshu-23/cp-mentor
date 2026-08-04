package com.cpmentor.worksheet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorksheetSaveRequest {

    @NotBlank
    private String fileName;

    @NotBlank
    private String markdown;
}
