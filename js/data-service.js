window.hgsData = (() => {
  const client = window.getSupabaseClient();

  const fetchGems = async () => {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user;
    const isAdmin = window.isHgsAdmin ? window.isHgsAdmin(user) : false;

    let query = client
      .from('gems')
      .select('id,name,image,subtitle,category,link,submitted_by,created_at,approved');
    if (!isAdmin) {
      query = query.eq('approved', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('Failed to fetch gems from Supabase:', error.message);
      return window.exploreData || {};
    }

    if (!data || data.length === 0) {
      return window.exploreData || {};
    }

    const grouped = {};
    (data || []).forEach((gem) => {
      if (!grouped[gem.category]) {
        grouped[gem.category] = [];
      }
      grouped[gem.category].push({
        id: gem.id,
        name: gem.name,
        image: gem.image,
        subtitle: gem.subtitle,
        link: gem.link,
        submittedBy: gem.submitted_by,
        approved: gem.approved !== false
      });
    });
    const base = window.exploreData || {};
    const merged = { ...base };
    Object.entries(grouped).forEach(([category, items]) => {
      merged[category] = [...(base[category] || []), ...items];
    });
    return merged;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, name }) => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    return data;
  };

  const getSession = async () => client.auth.getSession();

  const submitGem = async ({ name, image, subtitle, category, link, submittedBy }) => {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const payload = {
      user_id: user.id,
      name,
      image,
      subtitle,
      category,
      link: link || null,
      submitted_by: submittedBy || user.user_metadata?.full_name || user.email,
      approved: false
    };

    const { error } = await client.from('gems').insert(payload);
    if (error) {
      throw error;
    }
  };

  const approveGem = async (gemId) => {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user || !window.isHgsAdmin || !window.isHgsAdmin(user)) {
      throw new Error('Not authorized');
    }
    const { error } = await client.from('gems').update({ approved: true }).eq('id', gemId);
    if (error) {
      throw error;
    }
  };

  const getProfile = async () => {
    const { data: sessionData } = await client.auth.getSession();
    return sessionData?.session?.user || null;
  };

  return {
    fetchGems,
    signIn,
    signUp,
    getSession,
    submitGem,
    approveGem,
    getProfile
  };
})();
