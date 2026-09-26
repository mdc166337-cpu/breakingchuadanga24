{/* Form Body */}
    <div className="p-6 sm:p-8">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            এডমিন ইমেইল ঠিকানা
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="এডমিন ইমেইল লিখুন"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white text-gray-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">পাসওয়ার্ড</label>
            <button
              type="button"
              onClick={() => setShowSetupHint(!showSetupHint)}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              লগইন সহায়তা
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড দিন"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white text-gray-900"
            />
          </div>
        </div>

        {/* 2FA Code Input if triggered */}
        {require2FA && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>টু-ফ্যাক্টর অথেনটিকেশন (2FA) কোড দিন</span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="৬-সংখ্যার কোড (যেমন: 123456)"
              className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Super Admin Setup Hint Modal / Helper */}
        {showSetupHint && (
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1.5">
            <p className="font-bold text-gray-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> সুপার এডমিন তথ্য:
            </p>
            <p>
              • প্রাথমিক সুপার এডমিন: <strong>Nur Alam</strong>
            </p>
            <p>
              • ইমেইল: <strong>onlainshop240@gmail.com</strong>
            </p>
            <p>
              • প্রাথমিক অস্থায়ী পাসওয়ার্ড: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-red-700 font-bold">Admin@Chuadanga24#</code>
            </p>
            <p className="text-[11px] text-gray-500 italic">
              * সফল লগইনের পর আপনি ড্যাশবোর্ড থেকে তাৎক্ষণিকভাবে স্থায়ী ব্যক্তিগত পাসওয়ার্ড পরিবর্তন করে নিতে পারবেন।
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>যাচাই করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>এডমিন প্যানেলে প্রবেশ করুন</span>
            </>
          )}
        </button>
      </form>

      {/* Security Features Badge */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500">
        <span>✓ রিয়েল ডাটাবেজ ব্যাকএন্ড</span>
        <span>✓ রেট লিমিট প্রটেকশন</span>
        <span>✓ এনক্রিপ্টেড সেশন</span>
      </div>
    </div>

    {/* Footer Back Link */}
    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
      <button
        onClick={onBackToSite}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>মূল ওয়েবসাইটে ফিরে যান</span>
      </button>
    </div>
  </div>
</div>
