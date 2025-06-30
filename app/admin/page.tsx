"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, DollarSign, Mail, Settings, Download, RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 18750,
    monthlyRevenue: 4200,
    totalUsers: 127543,
    activeUsers: 1247,
    conversionRate: 15.2,
    emailsGenerated: 89234,
    upgradesLast24h: 89,
    apiCalls: 234567,
    revenueByPlan: {
      quick: 2500,
      extended: 8900,
      pro: 5200,
      enterprise: 2150,
    },
    userGrowth: [
      { month: "Jan", users: 1200, revenue: 2800 },
      { month: "Feb", users: 1800, revenue: 3200 },
      { month: "Mar", users: 2400, revenue: 3800 },
      { month: "Apr", users: 3200, revenue: 4200 },
    ],
  })

  const [isLoading, setIsLoading] = useState(false)

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 100),
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
    }))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={refreshData} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8.2% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Generated</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.emailsGenerated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="api">API Usage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.revenueByPlan).map(([plan, revenue]) => (
                      <div key={plan} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {plan}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">
                            {((revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { user: "user_123", plan: "Pro", amount: 9.99, time: "2 min ago" },
                      { user: "user_456", plan: "Extended", amount: 2.99, time: "5 min ago" },
                      { user: "user_789", plan: "Enterprise", amount: 29.99, time: "8 min ago" },
                      { user: "user_012", plan: "Quick", amount: 0.99, time: "12 min ago" },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{transaction.user}</div>
                          <div className="text-sm text-gray-500">{transaction.plan} Plan</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${transaction.amount}</div>
                          <div className="text-sm text-gray-500">{transaction.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.userGrowth.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{data.month}</span>
                        <div className="text-right">
                          <div className="font-semibold">{data.users.toLocaleString()} users</div>
                          <div className="text-sm text-gray-500">${data.revenue.toLocaleString()} revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>User Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Free Users</span>
                      <Badge variant="secondary">84.8%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quick Plan</span>
                      <Badge variant="secondary">8.2%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Extended Plan</span>
                      <Badge variant="secondary">4.5%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pro Plan</span>
                      <Badge variant="secondary">2.1%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Enterprise</span>
                      <Badge variant="secondary">0.4%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total API Calls</span>
                      <span className="font-semibold">{analytics.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calls Today</span>
                      <span className="font-semibold">12,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-semibold">145ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <Badge className="bg-green-100 text-green-800">99.8%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top API Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top API Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { customer: "TechCorp Inc.", calls: 45000, plan: "Enterprise" },
                      { customer: "DevStudio", calls: 23000, plan: "Pro" },
                      { customer: "StartupXYZ", calls: 12000, plan: "Pro" },
                      { customer: "WebAgency", calls: 8500, plan: "Starter" },
                    ].map((customer, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{customer.customer}</div>
                          <Badge variant="outline" className="text-xs">
                            {customer.plan}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{customer.calls.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">calls/month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Email Providers</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>mail.tm</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>guerrillamail</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>tempmail.lol</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">System Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>API Status</span>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Database</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Payment System</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex space-x-4">
                    <Button>Update Pricing</Button>
                    <Button variant="outline">Manage Users</Button>
                    <Button variant="outline">System Maintenance</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
