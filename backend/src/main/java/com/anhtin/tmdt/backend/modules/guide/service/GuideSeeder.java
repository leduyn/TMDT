package com.anhtin.tmdt.backend.modules.guide.service;

import com.anhtin.tmdt.backend.modules.guide.entity.Guide;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideStep;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideRepository;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideStepRepository;
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

    @Autowired
    private GuideStepRepository guideStepRepository;

    @Override
    public void run(String... args) throws Exception {
        seedTargets();
        seedGuides();
    }

    private void seedTargets() {
        if (guideTargetRepository.count() > 0) return;

        GuideTarget fab = new GuideTarget();
        fab.setKey("categoryFab");
        fab.setName("FAB Thêm danh mục");
        fab.setDescription("Nút floating action button để thêm danh mục sản phẩm mới");
        fab.setScreenName("CategoryList");
        guideTargetRepository.save(fab);

        GuideTarget searchBar = new GuideTarget();
        searchBar.setKey("searchBar");
        searchBar.setName("Thanh tìm kiếm danh mục");
        searchBar.setDescription("Thanh tìm kiếm để lọc danh mục sản phẩm");
        searchBar.setScreenName("CategoryList");
        guideTargetRepository.save(searchBar);

        GuideTarget sidebar = new GuideTarget();
        sidebar.setKey("categorySidebar");
        sidebar.setName("Sidebar danh mục");
        sidebar.setDescription("Thanh sidebar chứa danh sách danh mục và thương hiệu");
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
        Guide saved = guideRepository.save(guide);

        GuideTarget fab = guideTargetRepository.findByKey("categoryFab").orElse(null);
        GuideTarget searchBar = guideTargetRepository.findByKey("searchBar").orElse(null);
        GuideTarget sidebar = guideTargetRepository.findByKey("categorySidebar").orElse(null);

        if (fab != null) {
            GuideStep step1 = new GuideStep();
            step1.setGuideId(saved.getId());
            step1.setTargetId(fab.getId());
            step1.setTitle("Mở thêm danh mục");
            step1.setDescription("Chạm vào nút này để mở thêm danh mục sản phẩm bạn muốn kinh doanh.");
            step1.setPlacement("left");
            step1.setStepOrder(1);
            guideStepRepository.save(step1);
        }

        if (searchBar != null) {
            GuideStep step2 = new GuideStep();
            step2.setGuideId(saved.getId());
            step2.setTargetId(searchBar.getId());
            step2.setTitle("Tìm kiếm sản phẩm");
            step2.setDescription("Nhập tên sản phẩm để tìm kiếm nhanh trong danh mục.");
            step2.setPlacement("bottom");
            step2.setStepOrder(2);
            guideStepRepository.save(step2);
        }

        if (sidebar != null) {
            GuideStep step3 = new GuideStep();
            step3.setGuideId(saved.getId());
            step3.setTargetId(sidebar.getId());
            step3.setTitle("Danh mục sản phẩm");
            step3.setDescription("Chọn danh mục để xem các sản phẩm thuộc danh mục đó.");
            step3.setPlacement("right");
            step3.setStepOrder(3);
            guideStepRepository.save(step3);
        }
    }
}