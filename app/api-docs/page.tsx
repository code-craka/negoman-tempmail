"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Key, Zap, Shield, ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"

export default function ApiDocsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [apiKey, setApiKey] = useState("your_api_key_here")

  const codeExamples = {
    javascript: {
      generate: `// Generate a temporary email
const response = await fetch('https://tempmail.dev/api/v1/email/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: 'custom.com', // optional
    prefix: 'myemail'     // optional
  })
});

const data = await response.json();
console.log(data.email.address);`,

      messages: `// Get messages for an email
const response = await fetch('https://tempmail.dev/api/v1/email/messages?email=test@tempmail.dev', {
  headers: {
    'Authorization': 'Bearer ${apiKey}'
  }
});

const data = await response.json();
console.log(data.messages);`,
    },

    python: {
      generate: `import requests

# Generate a temporary email
response = requests.post('https://tempmail.dev/api/v1/email/generate', 
    headers={
        'Authorization': f'Bearer ${apiKey}',
        'Content-Type': 'application/json'
    },
    json={
        'domain': 'custom.com',  # optional
        'prefix': 'myemail'      # optional
    }
)

data = response.json()
print(data['email']['address'])`,

      messages: `import requests

# Get messages for an email
response = requests.get('https://tempmail.dev/api/v1/email/messages',
    headers={'Authorization': f'Bearer ${apiKey}'},
    params={'email': 'test@tempmail.dev'}
)

data = response.json()
print(data['messages'])`,
    },

    php: {
      generate: `<?php
// Generate a temporary email
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://tempmail.dev/api/v1/email/generate');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'domain' => 'custom.com',  // optional
    'prefix' => 'myemail'      // optional
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${apiKey}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
echo $data['email']['address'];
curl_close($ch);
?>`,

      messages: `<?php
// Get messages for an email
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://tempmail.dev/api/v1/email/messages?email=test@tempmail.dev');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${apiKey}'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data['messages']);
curl_close($ch);
?>`,
    },

    curl: {
      generate: `# Generate a temporary email
curl -X POST https://tempmail.dev/api/v1/email/generate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "custom.com",
    "prefix": "myemail"
  }'`,

      messages: `# Get messages for an email
curl -X GET "https://tempmail.dev/api/v1/email/messages?email=test@tempmail.dev" \\
  -H "Authorization: Bearer ${apiKey}"`,
    },
  }

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      requests: "100/month",
      features: ["Basic API access", "Rate limiting", "Community support"],
      color: "gray",
    },
    {
      name: "Starter",
      price: "$29",
      requests: "10,000/month",
      features: ["Higher rate limits", "Email support", "Usage analytics"],
      color: "blue",
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      requests: "100,000/month",
      features: ["Priority support", "Custom domains", "Webhooks"],
      color: "purple",
    },
    {
      name: "Enterprise",
      price: "$299",
      requests: "Unlimited",
      features: ["Dedicated support", "SLA guarantee", "Custom integration"],
      color: "gold",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to TempMail</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">Get API Key</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful API for Developers</h1>
          <p className="text-xl text-gray-600 mb-8">
            Integrate temporary email functionality into your applications with our RESTful API
          </p>

          <div className="flex justify-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <Shield className="mr-1 h-3 w-3" />
              99.9% Uptime
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <Zap className="mr-1 h-3 w-3" />
              Fast Response
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              <Code className="mr-1 h-3 w-3" />
              RESTful API
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Get your API key</h3>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <code className="text-sm">{apiKey}</code>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2. Make your first request</h3>
                    <p className="text-gray-600 mb-3">Generate a temporary email address using our API:</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Reference */}
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="generate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generate">Generate Email</TabsTrigger>
                    <TabsTrigger value="messages">Get Messages</TabsTrigger>
                    <TabsTrigger value="delete">Delete Email</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generate" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-green-600">POST</Badge>
                        <code>/api/v1/email/generate</code>
                      </div>
                      <p className="text-sm text-gray-600">Generate a new temporary email address</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Request Body</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-sm">
                          {`{
  "domain": "custom.com",    // optional
  "prefix": "myemail",       // optional
  "duration": 3600           // optional, seconds
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-sm">
                          {`{
  "success": true,
  "email": {
    "address": "myemail@custom.com",
    "expires_at": "2024-01-01T12:00:00Z",
    "provider": "tempmail.dev"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-blue-600">GET</Badge>
                        <code>/api/v1/email/messages</code>
                      </div>
                      <p className="text-sm text-gray-600">Retrieve messages for a temporary email</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Query Parameters</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-sm">
                          {`email: string (required) - The email address
limit: number (optional) - Max messages to return
offset: number (optional) - Pagination offset`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-sm">
                          {`{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "from": "sender@example.com",
      "subject": "Welcome!",
      "content": "Hello world",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="delete" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-red-600">DELETE</Badge>
                        <code>/api/v1/email/{`{email}`}</code>
                      </div>
                      <p className="text-sm text-gray-600">Delete a temporary email and all its messages</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-sm">
                          {`{
  "success": true,
  "message": "Email deleted successfully"
}`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    {Object.keys(codeExamples).map((lang) => (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Generate Email</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          {codeExamples[selectedLanguage as keyof typeof codeExamples].generate}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Get Messages</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          {codeExamples[selectedLanguage as keyof typeof codeExamples].messages}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  API Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-4 border rounded-lg ${
                      tier.popular ? "border-blue-300 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    {tier.popular && <Badge className="mb-2 bg-blue-600">Most Popular</Badge>}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{tier.name}</h3>
                      <span className="text-lg font-bold">{tier.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tier.requests}</p>
                    <ul className="space-y-1 text-sm">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-3" variant={tier.popular ? "default" : "outline"}>
                      Choose Plan
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Plan</span>
                  <Badge variant="secondary">100/hour</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Starter Plan</span>
                  <Badge variant="secondary">1,000/hour</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pro Plan</span>
                  <Badge variant="secondary">10,000/hour</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enterprise</span>
                  <Badge variant="secondary">Unlimited</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  📚 View Examples
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  💬 Join Discord
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  📧 Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  🐛 Report Bug
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
