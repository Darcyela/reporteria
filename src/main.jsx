import { StrictMode, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BrandProvider, useBrand } from '@achsux/ui'
import '@achsux/tokens'
import './fonts.css'
import './achs-ui.css'
import './index.css'
import App from './App.jsx'

const BRAND = 'seguro'
const BRAND_STORAGE_KEY = 'achs-web-kit-brand'

try {
  localStorage.setItem(BRAND_STORAGE_KEY, BRAND)
} catch {
  /* ignore */
}
document.documentElement.setAttribute('data-brand', BRAND)

/** Asegura marca Seguro Laboral aunque el DS lea otra marca desde localStorage. */
function ForceSeguroBrand({ children }) {
  const { brand, setBrand } = useBrand()

  useLayoutEffect(() => {
    if (brand !== BRAND) setBrand(BRAND)
    document.documentElement.setAttribute('data-brand', BRAND)
  }, [brand, setBrand])

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrandProvider defaultBrand={BRAND}>
      <ForceSeguroBrand>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ForceSeguroBrand>
    </BrandProvider>
  </StrictMode>,
)
