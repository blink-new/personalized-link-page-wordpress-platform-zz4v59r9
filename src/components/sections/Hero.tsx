import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Star, Users, Zap } from "lucide-react"
import { blink } from "@/blink/client"

export function Hero() {
  const handleGetStarted = () => {
    blink.auth.login()
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 bg-[size:20px_20px] opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 50,000+ professionals
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Your
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}Professional{" "}
              </span>
              Link Page
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Build a stunning, customizable link page in minutes. Perfect for creators, 
              professionals, and businesses who want to showcase their work beautifully.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span className="text-gray-600">50K+ Users</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-accent mr-2" />
                <span className="text-gray-600">2M+ Page Views</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-600">4.9/5 Rating</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Demo Preview */}
          <div className="relative">
            <div className="relative z-10">
              <Card className="p-6 bg-white shadow-2xl border-0 max-w-sm mx-auto">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">JS</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">John Smith</h3>
                  <p className="text-gray-600 mb-6">UI/UX Designer & Developer</p>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-left">
                      <div className="font-medium text-gray-900">Portfolio</div>
                      <div className="text-sm text-gray-500">johnsmith.design</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-left">
                      <div className="font-medium text-gray-900">LinkedIn</div>
                      <div className="text-sm text-gray-500">Connect with me</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-left">
                      <div className="font-medium text-gray-900">GitHub</div>
                      <div className="text-sm text-gray-500">View my code</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/20 rounded-full animate-pulse delay-1000" />
          </div>
        </div>
      </div>
    </section>
  )
}