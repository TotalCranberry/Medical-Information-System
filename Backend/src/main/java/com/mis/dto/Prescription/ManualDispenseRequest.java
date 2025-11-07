package com.mis.dto.Prescription;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualDispenseRequest {
    private List<Item> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private Long itemId;
        private Integer quantity;
        private String medicineName; // optional override; defaults to item's medicineName
        private Integer dispensedQuantity;
        private Integer dispensedStatus;
    }
}