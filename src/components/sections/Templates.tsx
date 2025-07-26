import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart } from "lucide-react"

const templates = [
  {
    id: 1,
    name: "Creative Designer",
    category: "Design",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=600&fit=crop&crop=center",
    likes: 1240,
    views: 8500,
    colors: ["#6366F1", "#F59E0B", "#EF4444"]
  },
  {
    id: 2,
    name: "Medical Professional",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop&crop=center",
    likes: 890,
    views: 6200,
    colors: ["#10B981", "#3B82F6", "#8B5CF6"]
  },
  {
    id: 3,
    name: "Tech Developer",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=600&fit=crop&crop=center",
    likes: 2100,
    views: 12000,
    colors: ["#1F2937", "#6366F1", "#F59E0B"]
  },
  {
    id: 4,
    name: "Fitness Trainer",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center",
    likes: 1560,
    views: 9800,
    colors: ["#EF4444", "#F59E0B", "#10B981"]
  },
  {
    id: 5,
    name: "Business Executive",
    category: "Business",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
    likes: 780,
    views: 5400,
    colors: ["#1F2937", "#6B7280", "#3B82F6"]
  },
  {
    id: 6,
    name: "Content Creator",
    category: "Social Media",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=400&h=600&fit=crop&crop=center",
    likes: 3200,
    views: 18000,
    colors: ["#EC4899", "#8B5CF6", "#F59E0B"]
  }
]

export function Templates() {
  return (
    <section id="templates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Professional
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Templates
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our collection of professionally designed templates, 
            crafted for different industries and personal brands.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card key={template.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <Button className="w-full" variant="secondary">
                      Preview Template
                    </Button>
                  </div>
                </div>
                
                {/* Category Badge */}
                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 hover:bg-white">
                  {template.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <div className="flex space-x-1">
                    {template.colors.map((color, index) => (
                      <div 
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {template.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {template.views.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Templates
          </Button>
        </div>
      </div>
    </section>
  )
}