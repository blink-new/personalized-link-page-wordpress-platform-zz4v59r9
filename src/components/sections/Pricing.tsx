import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { blink } from "@/blink/client"

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 7 custom links",
      "Basic templates",
      "Mobile responsive",
      "Basic analytics",
      "Community support"
    ],
    limitations: [
      "LinkTree Pro branding",
      "Limited customization"
    ],
    popular: false,
    cta: "Get Started Free"
  },
  {
    name: "Personal",
    price: 9,
    period: "month",
    description: "For individuals and creators",
    features: [
      "Unlimited links",
      "All premium templates",
      "Advanced customization",
      "Detailed analytics",
      "Remove branding",
      "Custom colors & fonts",
      "Social media integration",
      "Email support"
    ],
    limitations: [],
    popular: true,
    cta: "Start 3-Day Free Trial"
  },
  {
    name: "Professional",
    price: 29,
    period: "month",
    description: "For businesses and teams",
    features: [
      "Everything in Personal",
      "Team collaboration",
      "Advanced analytics",
      "A/B testing",
      "Custom domains",
      "Priority support",
      "White-label options",
      "API access"
    ],
    limitations: [],
    popular: false,
    cta: "Start 3-Day Free Trial"
  },
  {
    name: "Corporate",
    price: 99,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Advanced security",
      "SSO integration",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Custom development"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales"
  }
]

export function Pricing() {
  const handlePlanSelect = (planName: string) => {
    if (planName === "Free") {
      blink.auth.login()
    } else if (planName === "Corporate") {
      // Handle contact sales
      window.open("mailto:sales@linktreepro.com", "_blank")
    } else {
      blink.auth.login()
    }
  }

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 3-day free trial 
            with no commitment required.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' 
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start opacity-60">
                      <div className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mt-1" />
                      </div>
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include 99.9% uptime guarantee and 30-day money-back guarantee
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  )
}