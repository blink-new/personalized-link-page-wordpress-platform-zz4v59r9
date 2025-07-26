import { Card, CardContent } from "@/components/ui/card"
import { 
  Palette, 
  Smartphone, 
  BarChart3, 
  Globe, 
  Zap, 
  Shield,
  Move,
  Users
} from "lucide-react"

const features = [
  {
    icon: Palette,
    title: "Visual Customization",
    description: "Customize colors, fonts, backgrounds, and layouts with our intuitive visual editor."
  },
  {
    icon: Move,
    title: "Drag & Drop Builder",
    description: "Easily reorder links and sections with our simple drag-and-drop interface."
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Your page looks perfect on all devices with our responsive design system."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track clicks, views, and engagement with detailed analytics and insights."
  },
  {
    icon: Globe,
    title: "RTL Support",
    description: "Full right-to-left language support for Arabic and other RTL languages."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with instant loading and smooth interactions."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share and collaborate on pages with team members and clients."
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Stand Out
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to help you create professional link pages 
            that convert visitors into customers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}