import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const algorithms = [
  { name: "Dijkstra's Path", description: "Find the shortest path in a weighted grid.", path: "/Visuals/Djikstra", category: "Pathfinding" },
  { name: "A* Search", description: "An informed search algorithm, often faster than Dijkstra's.", path: "/Visuals/A", category: "Pathfinding" },
  { name: "Bubble Sort", description: "A simple sort that repeatedly steps through the list, swapping adjacent elements.", path: "/Visuals/BubbleSort", category: "Sorting" },
  { name: "Insertion Sort", description: "Builds the final sorted array one item at a time.", path: "/Visuals/InsertionSort", category: "Sorting" },
  { name: "Selection Sort", description: "Repeatedly finds the minimum element and moves it to the sorted part.", path: "/Visuals/SelectionSort", category: "Sorting" },
  { name: "Merge Sort", description: "A classic divide-and-conquer sorting algorithm.", path: "/Visuals/MergeSort", category: "Sorting" },
  { name: "Quick Sort", description: "An efficient sort that uses a pivot to partition the array.", path: "/Visuals/QuickSort", category: "Sorting" },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#FFF9C4] text-[#5a3019] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative text-center py-20 sm:py-24 md:py-32 rounded-3xl overflow-hidden bg-amber-100/50 border-2 border-amber-200 shadow-lg">
          <div className="absolute inset-0 bg-grid-amber-200/30 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          <div className="relative z-10 px-4">
            <div className="flex justify-center mb-6">
              <Image
                src="/bee.png"
                alt="Algo-Beesual Mascot"
                width={120}
                height={120}
                className="animate-bounce"
                style={{ animationDuration: '3s' }}
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Welcome to <span className="text-amber-600">Algo-Beesual</span>!
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-[#5a3019]/80 mb-8">
              A hive of interactive algorithm visualizations. Watch the bees sort and search their way through data, making complex concepts buzz with life!
            </p>
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-transform hover:scale-105">
              <Link href="/Visuals/BubbleSort">
                Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Algorithm Grid */}
        <div className="py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Choose Your Quest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {algorithms.map((algo) => (
              <Link href={algo.path} key={algo.name} legacyBehavior>
                <a className="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-amber-200 hover:border-amber-400 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                      {algo.name}
                    </h3>
                    <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      {algo.category}
                    </span>
                  </div>
                  <p className="text-[#5a3019]/70 mb-4">
                    {algo.description}
                  </p>
                  <div className="flex items-center text-amber-500 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Visualize Now</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
