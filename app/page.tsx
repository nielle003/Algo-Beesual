

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
      <div className="text-center px-6 py-10 max-w-3xl mx-auto">
        <h1 className="font-quicksand text-[#5a3019] text-5xl mb-5">
          Welcome to AlgoBeesual!
        </h1>

        <p className="font-quicksand text-[#5a3019] text-xl mb-5">
          Visualize sorting algorithms in action. Learn how algorithms like Bubble Sort, Merge Sort, and more work through interactive animations.
        </p>

        <p className="font-quicksand text-[#5a3019] text-lg mb-5">
          See algorithms step-by-step and compare their performance with different data sets.
        </p>

        <h3 className="font-quicksand text-[#5a3019] text-2xl mb-3">
          Key Features:
        </h3>
        <ul className="font-quicksand text-[#5a3019] text-lg list-disc ml-6 mb-8 text-left">
          <li>Interactive algorithm visualizations</li>
          <li>Step-by-step explanations</li>
          <li>Compare algorithm efficiency</li>
        </ul>

        <h3 className="font-quicksand text-[#5a3019] text-2xl mb-5">
          Start Exploring!
        </h3>
        <p className="font-quicksand text-[#5a3019] text-lg">
          Select an algorithm from the menu to see it in action!
        </p>
      </div>
    </main>
  );
}
