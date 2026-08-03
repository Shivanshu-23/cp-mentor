package com.cpmentor.method.dto;

import com.cpmentor.method.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {
    private Long id;
    private String patternSlug; // null for global resources
    private String title;
    private String url;
    private Resource.Type type;
    private String provider;
}
