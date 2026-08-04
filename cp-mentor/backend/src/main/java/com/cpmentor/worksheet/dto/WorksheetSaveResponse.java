package com.cpmentor.worksheet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WorksheetSaveResponse {
    private Long id;
    private String path;
    private String commitUrl;
}
