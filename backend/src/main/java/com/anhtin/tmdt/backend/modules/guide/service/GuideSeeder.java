package com.anhtin.tmdt.backend.modules.guide.service;

import com.anhtin.tmdt.backend.modules.guide.entity.Guide;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideRepository;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
public class GuideSeeder implements CommandLineRunner {

    @Autowired
    private GuideTargetRepository guideTargetRepository;

    @Autowired
    private GuideRepository guideRepository;

    @Override
    public void run(String... args) throws Exception {
        seedTargets();
        seedGuides();
    }

    private void seedTargets() {
        if (guideTargetRepository.count() > 0) return;

        GuideTarget fab = new GuideTarget();
        fab.setKey("category-fab");
        fab.setName("FAB Thêm danh mục");
        fab.setDescription("Nút floating action button để thêm danh mục sản phẩm mới");
        fab.setScreenName("CategoryList");
        guideTargetRepository.save(fab);

        GuideTarget searchBar = new GuideTarget();
        searchBar.setKey("category-search");
        searchBar.setName("Thanh tìm kiếm danh mục");
        searchBar.setDescription("Thanh tìm kiếm để lọc danh mục sản phẩm");
        searchBar.setScreenName("CategoryList");
        guideTargetRepository.save(searchBar);

        GuideTarget sidebar = new GuideTarget();
        sidebar.setKey("category-sidebar-toggle");
        sidebar.setName("Nút mở sidebar");
        sidebar.setDescription("Nút hamburger menu để mở sidebar điều hướng");
        sidebar.setScreenName("CategoryList");
        guideTargetRepository.save(sidebar);

        GuideTarget productItem = new GuideTarget();
        productItem.setKey("product-item");
        productItem.setName("Sản phẩm trong danh sách");
        productItem.setDescription("Một sản phẩm bất kỳ trong danh sách sản phẩm");
        productItem.setScreenName("ProductList");
        guideTargetRepository.save(productItem);

        GuideTarget cartFab = new GuideTarget();
        cartFab.setKey("cart-fab");
        cartFab.setName("FAB Giỏ hàng");
        cartFab.setDescription("Nút floating action button để xem giỏ hàng");
        cartFab.setScreenName("ProductList");
        guideTargetRepository.save(cartFab);

        GuideTarget orderSubmit = new GuideTarget();
        orderSubmit.setKey("order-submit");
        orderSubmit.setName("Nút đặt hàng");
        orderSubmit.setDescription("Nút xác nhận và đặt hàng");
        orderSubmit.setScreenName("Checkout");
        guideTargetRepository.save(orderSubmit);
    }

    private void seedGuides() {
        if (guideRepository.count() > 0) return;

        Guide guide = new Guide();
        guide.setName("Hướng dẫn danh mục sản phẩm");
        guide.setDescription("Hướng dẫn các thao tác cơ bản trên màn hình danh mục sản phẩm dành cho khách hàng mới");
        guide.setVersion(1);
        guide.setIsActive(true);
        guide.setConditions("{\"role\": [\"AGENCY\"]}");
        guideRepository.save(guide);
    }
}
