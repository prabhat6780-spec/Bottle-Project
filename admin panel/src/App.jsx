import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './redux/slices/loginSlice';
import { AbilityContext } from './context/AbilityContext';
import { defineAbilitiesFor } from './abilities';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import UserDetail from './pages/UserDetail';
import Brands from './pages/Brands';
import AddBrand from './pages/AddBrand';
import EditBrand from './pages/EditBrand';
import BottleSpecs from './pages/BottleSpecs';
import AddBottleSpec from './pages/AddBottleSpec';
import EditBottleSpec from './pages/EditBottleSpec';
import BottleSpecDetail from './pages/BottleSpecDetail';
import Variants from './pages/Variants';
import AddVariant from './pages/AddVariant';
import EditVariant from './pages/EditVariant';
import VariantDetail from './pages/VariantDetail';
import Productions from './pages/Productions';
import AddProduction from './pages/AddProduction';
import EditProduction from './pages/EditProduction';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Placeholder from './pages/Placeholder';
import PrintingTypes from './pages/PrintingTypes';
import AddPrintingType from './pages/AddPrintingType';
import EditPrintingType from './pages/EditPrintingType';
import PrintingColors from './pages/PrintingColors';
import AddPrintingColor from './pages/AddPrintingColor';
import EditPrintingColor from './pages/EditPrintingColor';
import Login from './pages/Login';
import RoleList from './pages/RoleList';
import CreateRole from './pages/CreateRole';
import PermissionList from './pages/PermissionList';
import CreatePermission from './pages/CreatePermission';
import './App.css';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const ability = defineAbilitiesFor(user);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AbilityContext.Provider value={ability}>
      <div className="admin-layout">
        <Sidebar collapsed={collapsed} />
        <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
          <Topbar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            onLogout={() => dispatch(logoutUser())}
          />
          <div className="page-wrapper p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/add" element={<AddUser />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
              <Route path="/users/view/:id" element={<UserDetail />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/add" element={<AddBrand />} />
              <Route path="/brands/edit/:id" element={<EditBrand />} />
              <Route path="/bottle-specs" element={<BottleSpecs />} />
              <Route path="/bottle-specs/add" element={<AddBottleSpec />} />
              <Route path="/bottle-specs/edit/:id" element={<EditBottleSpec />} />
              <Route path="/bottle-specs/view/:id" element={<BottleSpecDetail />} />
              <Route path="/variants" element={<Variants />} />
              <Route path="/variants/add" element={<AddVariant />} />
              <Route path="/variants/edit/:id" element={<EditVariant />} />
              <Route path="/variants/view/:id" element={<VariantDetail />} />
              <Route path="/productions" element={<Productions />} />
              <Route path="/productions/add" element={<AddProduction />} />
              <Route path="/productions/edit/:id" element={<EditProduction />} />
              <Route path="/printing-types" element={<PrintingTypes />} />
              <Route path="/printing-types/add" element={<AddPrintingType />} />
              <Route path="/printing-types/edit/:id" element={<EditPrintingType />} />
              <Route path="/printing-colors" element={<PrintingColors />} />
              <Route path="/printing-colors/add" element={<AddPrintingColor />} />
              <Route path="/printing-colors/edit/:id" element={<EditPrintingColor />} />
              <Route path="/roles" element={<RoleList />} />
              <Route path="/roles/create" element={<CreateRole />} />
              <Route path="/roles/edit/:id" element={<CreateRole />} />
              <Route path="/permissions" element={<PermissionList />} />
              <Route path="/permissions/create" element={<CreatePermission />} />
              <Route path="/permissions/edit/:id" element={<CreatePermission />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/analytics" element={<Placeholder title="Analytics" icon="bi-bar-chart-line-fill" desc="Deep-dive analytics" />} />
              <Route path="/reports" element={<Placeholder title="Reports" icon="bi-file-earmark-bar-graph-fill" desc="Generate and export reports" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </AbilityContext.Provider>
  );
}
