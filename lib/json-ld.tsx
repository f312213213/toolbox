const SITE_URL = "https://toolbox.chiendavid.com"

interface ToolJsonLdProps {
  name: string
  description: string
  path: string
}

export function ToolJsonLd({ name, description, path }: ToolJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: `${SITE_URL}${path}`,
    description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "David Chien",
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Toolbox",
      url: SITE_URL,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
