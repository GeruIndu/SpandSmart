import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      <section className="py-15 bg-blue-50">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{data.value}</div>
                <div className="text-gray-600">{data.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((data, index) => (
              <Card key={index} className="p-3">
                <CardContent className="space-y-4 pt-3">
                  {data.icon}
                  <h1 className="text-xl font-semibold">{data.title}</h1>
                  <p className="text-gray-600">{data.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">{data.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{data.title}</h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((data, index) => (
              <Card key={index} className="p-3">
                <CardContent className="pt-3">
                  <div className="flex items-center mb-4">
                    <Image
                      src={data.image}
                      alt={data.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-sm text-gray-600">{data.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600">{data.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section className="py-10 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready To Take Controlof Your Finances?
          </h2>
          <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
            Join Hundred of users who are already managing their finanace smarter with SpendSmart
          </p>
          <Link href={'/dashboard'}>
            <Button
              size={'lg'}
              className={'bg-white text-blue-600 hover:bg-blue-50 animate-bounce'}
            >Start Free Trail</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
