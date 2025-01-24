import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import AuthGuard from '@/config/AuthGuard'
import AdminLayout from '@/layouts/AdminLayout'
import { Suspense, lazy } from 'react'

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProductList = lazy(() => import('./pages/Product/List'))
const ProductCreate = lazy(() => import('./pages/Product/Create'))
const ProductEdit = lazy(() => import('./pages/Product/Edit'))
const ProductDetail = lazy(() => import('./pages/Product/Detail'))
const BrandList = lazy(() => import('./pages/Brand/List'))
const BrandCreate = lazy(() => import('./pages/Brand/Create'))
const BrandEdit = lazy(() => import('./pages/Brand/Edit'))
const TypeList = lazy(() => import('./pages/Type/List'))
const CreateType = lazy(() => import('./pages/Type/Create'))
const EditType = lazy(() => import('./pages/Type/Edit'))
const ReviewList = lazy(() => import('./pages/Review/List'))
const ReviewDetail = lazy(() => import('./pages/Review/Detail'))
const ReviewCreate = lazy(() => import('./pages/Review/Create'))
const ReviewEdit = lazy(() => import('./pages/Review/Edit'))
const UserList = lazy(() => import('./pages/User/List'))
const UserCreate = lazy(() => import('./pages/User/Create'))
const UserEdit = lazy(() => import('./pages/User/Edit'))
const UserDetail = lazy(() => import('./pages/User/Detail'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/auth/Login'))
const Unauthorized = lazy(() => import('./pages/auth/Unauthorized'))
const Company = lazy(() => import('./pages/Company'))
const StoragePage = lazy(() => import('./pages/storage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
)

// 受保护的布局组件
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 公共路由 */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/unauthorized" element={<Unauthorized />} />

            {/* 受保护的路由 */}
            <Route element={<ProtectedLayout />}>
              <Route element={<AuthGuard />}>
                <Route element={<AdminLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Dashboard />
                      </Suspense>
                    }
                  />

                  {/* 产品管理 */}
                  <Route path="/product">
                    <Route
                      index
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductEdit />
                        </Suspense>
                      }
                    />
                    <Route
                      path="detail/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductDetail />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 品牌管理 */}
                  <Route path="/brand">
                    <Route
                      index
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BrandList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BrandCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BrandEdit />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 测评管理 */}
                  <Route path="/review">
                    <Route
                      index
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ReviewList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="detail/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ReviewDetail />
                        </Suspense>
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ReviewCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ReviewEdit />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 类型管理 */}
                  <Route path="/types">
                    {/* 器具类型 */}
                    <Route path="utility">
                      <Route
                        index
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <TypeList type="utility" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateType type="utility" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <EditType type="utility" />
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* 产品类型 */}
                    <Route path="product">
                      <Route
                        index
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <TypeList type="product" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateType type="product" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <EditType type="product" />
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* 通道类型 */}
                    <Route path="channel">
                      <Route
                        index
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <TypeList type="channel" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateType type="channel" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <EditType type="channel" />
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* 材料类型 */}
                    <Route path="material">
                      <Route
                        index
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <TypeList type="material" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateType type="material" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <EditType type="material" />
                          </Suspense>
                        }
                      />
                    </Route>
                  </Route>

                  {/* 用户管理 */}
                  <Route path="/user">
                    <Route
                      index
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <UserList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <UserCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <UserEdit />
                        </Suspense>
                      }
                    />
                    <Route
                      path="detail/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <UserDetail />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 文件管理 */}
                  <Route path="/file">
                    <Route
                      index
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <StoragePage />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 企业管理 */}
                  <Route
                    path="/company"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Company />
                      </Suspense>
                    }
                  />

                  {/* 系统设置 */}
                  <Route
                    path="/settings"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Settings />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
            </Route>

            {/* 404 路由 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
