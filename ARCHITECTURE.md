# Frontend Architecture & Systematic Folder Guide

This codebase is organized cleanly into **OnlyDenims** (the parent platform) and **Stores** (multi-brand storefronts, including flagship **RBW**).

---

## 1. Routes (`frontend/app/`)

Next.js App Router organizes customer-facing platform pages inside a Route Group `(onlydenims)` so that URL paths remain clean (`/shop`, `/about`, `/product/[id]`) without prefix clutter, while separating them from store-specific routes.

```text
app/
├── (onlydenims)/              # All OnlyDenims platform routes (0 URL overhead)
│   ├── about/                 # /about
│   ├── accessibility/         # /accessibility
│   ├── accessories/           # /accessories
│   ├── account/               # /account (orders, wishlist, profile, etc.)
│   ├── blog/                  # /blog
│   ├── careers/               # /careers
│   ├── contact/               # /contact
│   ├── cookie-policy/         # /cookie-policy
│   ├── email/                 # /email
│   ├── experience-center/     # /experience-center
│   ├── faq/                   # /faq
│   ├── for-brands/            # /for-brands
│   ├── how-it-works/          # /how-it-works
│   ├── jackets/               # /jackets
│   ├── journey/               # /journey
│   ├── login/                 # /login
│   ├── privacy-policy/        # /privacy-policy
│   ├── product/               # /product/[id]
│   ├── refund-policy/         # /refund-policy
│   ├── resources/             # /resources
│   ├── return-policy/         # /return-policy
│   ├── returns/               # /returns
│   ├── search/                # /search
│   ├── shipping-policy/       # /shipping-policy
│   ├── shop/                  # /shop
│   ├── shorts/                # /shorts
│   ├── terms-and-conditions/  # /terms-and-conditions
│   └── wishlist/              # /wishlist
│
├── stores/                    # Multi-brand storefronts
│   ├── rbw/                   # Flagship RBW storefront (/stores/rbw)
│   │   ├── jackets/
│   │   ├── preview-3d/
│   │   ├── product/
│   │   ├── shorts/
│   │   └── page.tsx
│   ├── [slug]/                # Dynamic password-protected brand stores (/stores/:slug)
│   └── template/              # Interactive store template preview (/stores/template)
│
├── admin/                     # Store management & admin dashboards
│   └── stores/                # /admin/stores
│
├── api/                       # Backend API routes
│   ├── admin/
│   ├── stores/
│   ├── shopify/
│   └── chat/
│
├── layout.tsx                 # Root layout & providers
├── page.tsx                   # Main homepage (/)
├── globals.css                # Global stylesheet & design tokens
└── theme-provider.tsx         # Dark / Light theme provider
```

---

## 2. Components (`frontend/component/`)

The component directory has been simplified to exactly two top-level domains:

```text
component/
├── onlydenims/                # OnlyDenims platform components
│   ├── auth/                  # LoginForm, RegisterForm, KwikpassLoginModal, AuthSuccess
│   ├── collection/            # CollectionCategoryCard, CollectionFocusLayer, CollectionData
│   ├── experience-center/     # BrandShowroomExperience, MobileShowroomExperience, etc.
│   ├── home/                  # BrandHeader, BrandStoreCarousel, ShopByFit, QuickViewModal, etc.
│   ├── navbar/                # Navbar, MobileNav, SearchOverlay, AnnouncementBar, etc.
│   └── ui/                    # CartDrawer, DenimCard, SizeGuideDrawer, Footer, Logo, ChatBotWidget, etc.
│
└── stores/                    # Multi-brand stores components
    ├── rbw/                   # RBW flagship: 3D wash selection, RbwFitSelector, RbwJourneyShell, etc.
    ├── store-front/           # Reusable Storefront shell, StoreLoginGate, styling
    ├── store-template/        # Template Simulation Modal, 3D customizer, catalog
    └── store-admin/           # Store creation modal, ImagePicker, StoreDetailPanel
```

---

## 3. Public Assets (`frontend/public/`)

```text
public/
├── onlydenims/                # OnlyDenims brand logos, badges, hero imagery
└── stores/
    └── rbw/                   # RBW fit cutouts, 3D textures, banner images
```
