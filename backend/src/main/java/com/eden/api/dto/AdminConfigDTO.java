package com.eden.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminConfigDTO {
    private String provider;
    private String ollamaUrl;
}
