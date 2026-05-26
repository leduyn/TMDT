package com.anhtin.tmdt.backend.modules.agency.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyProductPriceDTO;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;

@SpringBootTest
public class AgencyProductPriceServiceTest {

    @Autowired
    private AgencyProductPriceService agencyProductPriceService;

    @MockBean
    private AgencyProductPriceRepository agencyProductPriceRepository;

    @MockBean
    private SystemConfigService systemConfigService;

    @Test
    public void testGetPricesForAgency_ExpiredOldPrice() {
        // Mock SystemConfig setting discount.max.days = 7
        when(systemConfigService.getDiscountMaxDays()).thenReturn(7);

        // Setup test data
        Agency agency = new Agency();
        agency.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Product Test");

        // Price updated 10 days ago (expired, since max days is 7)
        AgencyProductPrice price = new AgencyProductPrice();
        price.setId(100L);
        price.setAgency(agency);
        price.setProduct(product);
        price.setPrice(1000.0);
        price.setOldPrice(900.0);
        price.setUpdatedAt(LocalDateTime.now().minusDays(10));

        List<AgencyProductPrice> prices = new ArrayList<>();
        prices.add(price);

        when(agencyProductPriceRepository.findByAgencyId(1L)).thenReturn(prices);

        // Act
        List<AgencyProductPriceDTO> dtos = agencyProductPriceService.getPricesForAgency(1L, null);

        // Assert
        assertNotNull(dtos);
        assertEquals(1, dtos.size());
        AgencyProductPriceDTO dto = dtos.get(0);
        assertNull(dto.getOldPrice()); // Should be set to null since 10 days > 7 max days config
    }

    @Test
    public void testGetPricesForAgency_ActiveOldPrice() {
        // Mock SystemConfig setting discount.max.days = 7
        when(systemConfigService.getDiscountMaxDays()).thenReturn(7);

        // Setup test data
        Agency agency = new Agency();
        agency.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Product Test");

        // Price updated 3 days ago (active, since max days is 7)
        AgencyProductPrice price = new AgencyProductPrice();
        price.setId(100L);
        price.setAgency(agency);
        price.setProduct(product);
        price.setPrice(1000.0);
        price.setOldPrice(900.0);
        price.setUpdatedAt(LocalDateTime.now().minusDays(3));

        List<AgencyProductPrice> prices = new ArrayList<>();
        prices.add(price);

        when(agencyProductPriceRepository.findByAgencyId(1L)).thenReturn(prices);

        // Act
        List<AgencyProductPriceDTO> dtos = agencyProductPriceService.getPricesForAgency(1L, null);

        // Assert
        assertNotNull(dtos);
        assertEquals(1, dtos.size());
        AgencyProductPriceDTO dto = dtos.get(0);
        assertEquals(900.0, dto.getOldPrice()); // Should NOT be null since 3 days <= 7 max days config
    }
}
