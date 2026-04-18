import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 lg:py-32">
        <div className="animate-rise max-w-3xl space-y-8">
          {/* Hero Badge */}
          <div className="inline-flex">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-accent-500 to-transparent"></div>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-tight">
            Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-600">simplified</span>
          </h1>

          {/* Subheading - Minimal */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Book appointments, manage schedules, streamlined healthcare.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Link to="/doctors" className="btn-primary px-8 py-3 text-base">
              Explore Doctors
            </Link>
            <Link to="/register" className="btn-ghost px-8 py-3 text-base">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="px-6 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="group animate-rise rounded-3xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm hover:shadow-soft transition-all [animation-delay:0ms]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">Find Doctors</h3>
              <p className="text-sm text-slate-600">Browse specialists by expertise and availability.</p>
            </div>

            {/* Card 2 */}
            <div className="group animate-rise rounded-3xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm hover:shadow-soft transition-all [animation-delay:80ms]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">Book Instantly</h3>
              <p className="text-sm text-slate-600">Reserve your slot without conflicts.</p>
            </div>

            {/* Card 3 */}
            <div className="group animate-rise rounded-3xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm hover:shadow-soft transition-all [animation-delay:160ms]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">Stay Updated</h3>
              <p className="text-sm text-slate-600">Get instant notifications for your appointments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-r from-accent-50 to-white border border-accent-200 p-10 lg:p-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-4">
              Ready to get started?
            </h2>
            <p className="text-slate-600 mb-8">Join thousands of patients managing their healthcare effortlessly.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-secondary px-8 py-3 text-base">
                Create Account
              </Link>
              <Link to="/login" className="btn-ghost px-8 py-3 text-base">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
