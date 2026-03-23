import { LinkIcon, PenSquareIcon, SettingsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@/components/ui/_index";

function SectionHeader({
  headline,
  title,
  description,
}: {
  headline: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs">{headline}</div>
      <h3 className="font-bold text-xl">{title}</h3>
      <div>{description}</div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-lg bg-foreground p-4 text-primary-foreground">
      <div className="grid grid-flow-col justify-center">{icon}</div>
      <div>{title}</div>
      <div className="text-xs">{description}</div>
    </div>
  );
}

function IntegrationCard({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="grid gap-4 rounded-lg p-4">
      <div className="grid grid-flow-col justify-center">{icon}</div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
}: {
  name: string;
  price: string;
  features: string[];
}) {
  return (
    <div className="w-fit space-y-8 rounded-lg border border-foreground px-8 py-12">
      <div className="space-y-2">
        <div className="font-bold text-xl">{name}</div>
        <div className="text-lg">{price}</div>
      </div>
      <ul className="list-disc pl-4">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Button className="rounded-full">Get started today</Button>
    </div>
  );
}

function DeveloperCard({
  name,
  title,
  imageUrl,
  url,
}: {
  name: string;
  title: string;
  imageUrl: string;
  url: string;
}) {
  return (
    <div className="grid w-fit gap-2">
      <div className="grid grid-flow-col items-center gap-4">
        <Image
          src={imageUrl}
          alt={name}
          width={64}
          height={64}
          className="rounded-full"
          unoptimized
        />
        <div className="space-y-2">
          <div>
            <div className="font-bold">{name}</div>
            <div className="text-xs">{title}</div>
          </div>
          <div>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <LinkIcon size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="space-y-16 py-16">
      <section className="space-y-8">
        <h1 className="font-bold text-4xl">
          Example is a awesome product for life and work
        </h1>
        <h2 className="font-bold">I like to build and learn new things</h2>
      </section>
      <section>
        <Image
          src="/images/example.svg"
          alt="A product image"
          width={1024}
          height={768}
          className="rounded-lg"
          unoptimized
        />
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="Features"
          title="Features - title"
          description="Features - description"
        />
        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          <FeatureCard
            title="Feature 1"
            description="Description of feature 1."
            icon={<SettingsIcon />}
          />
          <FeatureCard
            title="Feature 2"
            description="Description of feature 2."
            icon={<SettingsIcon />}
          />
          <FeatureCard
            title="Feature 3"
            description="Description of feature 3."
            icon={<SettingsIcon />}
          />
          <FeatureCard
            title="Feature 4"
            description="Description of feature 4."
            icon={<SettingsIcon />}
          />
          <FeatureCard
            title="Feature 5"
            description="Description of feature 5."
            icon={<SettingsIcon />}
          />
          <FeatureCard
            title="Feature 6"
            description="Description of feature 6."
            icon={<SettingsIcon />}
          />
        </div>
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="Feature spotlight"
          title="Feature spotlight - title"
          description="Feature spotlight - description"
        />
        <div>
          <Image
            src="/images/example.svg"
            alt="A feature spotlight image"
            width={1024}
            height={768}
            className="rounded-lg"
            unoptimized
          />
        </div>
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="Integrations"
          title="Integrations - title"
          description="Integrations - description"
        />
        <div className="grid grid-cols-4 grid-rows-3 gap-4">
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
          <IntegrationCard icon={<PenSquareIcon size={16} />} />
        </div>
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="Pricing"
          title="Pricing - title"
          description="Pricing - description"
        />
        <div className="grid grid-flow-col justify-center gap-4">
          <PlanCard
            name="Free Plan"
            price="Free"
            features={["Feature 1", "Feature 2", "Feature 3"]}
          />
          <PlanCard
            name="Free Plan"
            price="Free"
            features={["Feature 1", "Feature 2", "Feature 3"]}
          />
        </div>
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="FAQ"
          title="FAQ - title"
          description="FAQ - description"
        />
        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1">
              <AccordionTrigger>Question 1</AccordionTrigger>
              <AccordionContent>Answer to question 1.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Question 2</AccordionTrigger>
              <AccordionContent>Answer to question 2.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>Question 3</AccordionTrigger>
              <AccordionContent>Answer to question 3.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <section className="space-y-8">
        <SectionHeader
          headline="About us"
          title="About us - title"
          description="About us - description"
        />
        <div className="grid justify-center gap-4">
          <DeveloperCard
            imageUrl="/images/example-icon.svg"
            name="[example]"
            title="Product Engineer"
            url="https://example.com/"
          />
        </div>
      </section>
    </main>
  );
}
