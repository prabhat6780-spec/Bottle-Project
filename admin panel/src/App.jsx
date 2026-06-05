import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './redux/slices/loginSlice';
import { AbilityContext } from './context/AbilityContext';
import { defineAbilitiesFor } from './abilities';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/system/Dashboard';
import Users from './pages/Users/Users';
import AddUser from './pages/Users/AddUser';
import EditUser from './pages/Users/EditUser';
import UserDetail from './pages/Users/UserDetail';
import Companies from './pages/Company/Companies';
import AddCompany from './pages/Company/AddCompany';
import EditCompany from './pages/Company/EditCompany';
import Brands from './pages/Brands/Brands';
import AddBrand from './pages/Brands/AddBrand';
import EditBrand from './pages/Brands/EditBrand';
import BottleSpecs from './pages/BottleSpec/BottleSpecs';
import AddBottleSpec from './pages/BottleSpec/AddBottleSpec';
import EditBottleSpec from './pages/BottleSpec/EditBottleSpec';
import BottleSpecDetail from './pages/BottleSpec/BottleSpecDetail';
import Variants from './pages/variant/Variants';
import AddVariant from './pages/variant/AddVariant';
import EditVariant from './pages/variant/EditVariant';
import VariantDetail from './pages/variant/VariantDetail';
import Productions from './pages/Production/Productions';
import Production from './pages/Production/Production';
import AddProduction from './pages/Production/AddProduction';
import EditProduction from './pages/Production/EditProduction';
import ProductionDetail from './pages/Production/ProductionDetail';
import Settings from './pages/system/Settings';
import ChangePassword from './pages/system/ChangePassword';
import Placeholder from './pages/system/Placeholder';
import PrintingTypes from './pages/PrintingTypes/PrintingTypes';
import AddPrintingType from './pages/PrintingTypes/AddPrintingType';
import EditPrintingType from './pages/PrintingTypes/EditPrintingType';
import PrintingColors from './pages/PrintingColor/PrintingColors';
import AddPrintingColor from './pages/PrintingColor/AddPrintingColor';
import EditPrintingColor from './pages/PrintingColor/EditPrintingColor';
import CoatingTypes from './pages/CoatingType/CoatingTypes';
import AddCoatingType from './pages/CoatingType/AddCoatingType';
import EditCoatingType from './pages/CoatingType/EditCoatingType';
import CoatingColors from './pages/CoatingColor/CoatingColors';
import AddCoatingColor from './pages/CoatingColor/AddCoatingColor';
import EditCoatingColor from './pages/CoatingColor/EditCoatingColor';
import Login from './pages/system/Login';
import RoleList from './pages/Roles&Permission/RoleList';
import CreateRole from './pages/Roles&Permission/CreateRole';
import PermissionList from './pages/Roles&Permission/PermissionList';
import CreatePermission from './pages/Roles&Permission/CreatePermission';
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
        <Sidebar collapsed={collapsed} onClose={() => setCollapsed(false)} />
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
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/add" element={<AddCompany />} />
              <Route path="/companies/edit/:id" element={<EditCompany />} />
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
              <Route path="/production" element={<Production />} />
              <Route path="/productions/add" element={<AddProduction />} />
              <Route path="/productions/edit/:id" element={<EditProduction />} />
              <Route path="/productions/view/:id" element={<ProductionDetail />} />
              <Route path="/printing-types" element={<PrintingTypes />} />
              <Route path="/printing-types/add" element={<AddPrintingType />} />
              <Route path="/printing-types/edit/:id" element={<EditPrintingType />} />
              <Route path="/printing-colors" element={<PrintingColors />} />
              <Route path="/printing-colors/add" element={<AddPrintingColor />} />
              <Route path="/printing-colors/edit/:id" element={<EditPrintingColor />} />
              <Route path="/coating-types" element={<CoatingTypes />} />
              <Route path="/coating-types/add" element={<AddCoatingType />} />
              <Route path="/coating-types/edit/:id" element={<EditCoatingType />} />
              <Route path="/coating-colors" element={<CoatingColors />} />
              <Route path="/coating-colors/add" element={<AddCoatingColor />} />
              <Route path="/coating-colors/edit/:id" element={<EditCoatingColor />} />
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
