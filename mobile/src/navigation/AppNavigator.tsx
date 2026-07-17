import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';
import { GuideOverlay } from '../guide/GuideOverlay';
import { CustomTabBar2 } from '../components/CustomTabBar2';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoryListScreen } from '../screens/products/CategoryListScreen';
import { OpenCategoriesScreen } from '../screens/products/OpenCategoriesScreen';
import { CategoryProductsScreen } from '../screens/products/CategoryProductsScreen';
import { ProductListScreen } from '../screens/products/ProductListScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/cart/CheckoutScreen';
import { DebtScreen } from '../screens/debt/DebtScreen';
import { PromotionsScreen } from '../screens/promotions/PromotionsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar2 {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Categories" component={CategoryListScreen} options={{ tabBarLabel: 'Danh mục' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Giỏ hàng' }} />
      <Tab.Screen name="Debt" component={DebtScreen} options={{ tabBarLabel: 'Công nợ' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <GuideOverlay />
      <Stack.Navigator
        key={isAuthenticated ? 'auth' : 'guest'}
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={HomeTabs} options={{ headerShown: false, title: '' }} />
            <Stack.Screen
              name="CategoryList"
              component={CategoryListScreen}
              options={{ title: 'Danh mục sản phẩm' }}
            />
            <Stack.Screen
              name="OpenCategories"
              component={OpenCategoriesScreen}
              options={{ title: 'Mở thêm danh mục' }}
            />
            <Stack.Screen
              name="CategoryProducts"
              component={CategoryProductsScreen}
              options={{ title: 'Sản phẩm' }}
            />
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ title: 'Sản phẩm' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: 'Chi tiết sản phẩm' }}
            />
            <Stack.Screen
              name="Promotions"
              component={PromotionsScreen}
              options={{ title: 'Khuyến mãi' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Thông báo' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Xác nhận giỏ hàng' }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Chi tiết đơn hàng' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
