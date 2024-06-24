import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function StepAccordion({ details, subdetails }) {
  return (
    <Accordion type="single" collapsible className="">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-slate-600 text-sm font-normal py-1">
          {details}
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm font-normal">
          {subdetails}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
