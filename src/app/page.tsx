import { Button } from "~/components/ui/button";

export default async function Home() {
  return (
    <>
      <div className="text-red-500 flex flex-col items-center justify-center w-screen h-screen">
        <h1>Home</h1>
        <Button>Click Me</Button>
      </div>
    </>
  );
}
