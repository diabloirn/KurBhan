import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import Tracking from './pages/Tracking'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

import FAQ from './pages/FAQ'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
