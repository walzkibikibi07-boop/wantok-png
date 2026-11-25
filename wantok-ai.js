(function () {
  "use strict";
  if (window.__WANTOK_AI_WIDGET__) return;
  window.__WANTOK_AI_WIDGET__ = true;

  var SB_URL = "https://rpcekiqhvsmzjmjimnsj.supabase.co";
  var SB_KEY = "sb_publishable_bmR_OLpVkON13vH-uTCkRg_GGH8jllW";
  var db = null;
  var liveData = { posts: [], jobs: [], businesses: [], products: [], talents: [], services: [], locations: [], districtContacts: [], ready: false };
  var history = [];
  var busy = false;
  var mode = "general";
  var language = "tpi";

  function el(tag, attrs, content) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    if (content != null) node.textContent = content;
    return node;
  }
  function addStyles() {
    var css = [
      "#wantok-ai-launch{position:fixed;right:14px;bottom:104px;z-index:99980;background:#0d1b2e;color:#f5b800;border:2px solid #f5b800;border-radius:28px;padding:12px 16px;font-weight:900;font-size:14px;box-shadow:0 5px 18px #0004}",
      "#wantok-ai-panel{position:fixed;right:10px;bottom:164px;z-index:99990;width:min(390px,calc(100vw - 20px));height:min(590px,calc(100dvh - 190px));min-height:350px;background:#fff;border-radius:18px;box-shadow:0 12px 45px #0005;display:none;overflow:hidden;font:14px Arial,sans-serif;color:#172033}",
      "#wantok-ai-panel.open{display:flex;flex-direction:column}",
      "#wantok-ai-head{background:#0d1b2e;color:#fff;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}",
      "#wantok-ai-head strong{font-size:16px;color:#f5b800}",
      "#wantok-ai-close{color:#fff;font-size:23px;padding:0 5px}",
      "#wantok-ai-controls{display:flex;gap:7px;padding:9px 10px;background:#f3f6fa}",
      "#wantok-ai-controls select{min-width:0;flex:1;border:1px solid #d5dce5;border-radius:9px;padding:8px;background:#fff;color:#172033;font-size:13px}",
      "#wantok-ai-messages{flex:1;overflow:auto;padding:12px;background:#f8fafc;display:flex;flex-direction:column;gap:9px}",
      ".wantok-ai-msg{max-width:88%;padding:10px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}",
      ".wantok-ai-msg.user{align-self:flex-end;background:#0d1b2e;color:#fff;border-bottom-right-radius:4px}",
      ".wantok-ai-msg.assistant{align-self:flex-start;background:#e9eff6;color:#172033;border-bottom-left-radius:4px}",
      "#wantok-ai-compose{display:flex;gap:7px;padding:10px;border-top:1px solid #e4e8ee;background:#fff}",
      "#wantok-ai-input{flex:1;min-width:0;resize:none;border:1px solid #d5dce5;border-radius:12px;padding:10px;font:14px Arial,sans-serif;max-height:100px}",
      "#wantok-ai-send{background:#1f9d4a;color:#fff;border-radius:12px;padding:0 15px;font-weight:800}",
      "#wantok-ai-send:disabled{opacity:.55}",
      "#wantok-ai-foot{font-size:10px;color:#697586;padding:0 12px 8px;background:#fff}",
      "@media(max-width:480px){#wantok-ai-panel{right:7px;bottom:155px;width:calc(100vw - 14px);height:calc(100dvh - 180px);max-height:620px}#wantok-ai-launch{bottom:94px}}"
    ].join("");
    var style = el("style", { id: "wantok-ai-style" }, css);
    document.head.appendChild(style);
  }
  function appendMessage(role, text) {
    var area = document.getElementById("wantok-ai-messages");
    var bubble = el("div", { className: "wantok-ai-msg " + role });
    var value = String(text || "");
    if (role === "assistant") {
      var urlPattern = /https?:\/\/[^\s)]+/g;
      var last = 0, match;
      while ((match = urlPattern.exec(value)) !== null) {
        if (match.index > last) bubble.appendChild(document.createTextNode(value.slice(last, match.index)));
        var link = el("a", { href: match[0], target: "_blank", rel: "noopener noreferrer" }, match[0]);
        link.style.cssText = "color:#075fbd;text-decoration:underline;overflow-wrap:anywhere";
        bubble.appendChild(link);
        last = match.index + match[0].length;
      }
      if (last < value.length) bubble.appendChild(document.createTextNode(value.slice(last)));
    } else {
      bubble.textContent = value;
    }
    area.appendChild(bubble);
    area.scrollTop = area.scrollHeight;
  }
  function setBusy(value) {
    busy = value;
    var button = document.getElementById("wantok-ai-send");
    var input = document.getElementById("wantok-ai-input");
    if (button) { button.disabled = value; button.textContent = value ? "..." : "Send"; }
    if (input) input.disabled = value;
  }
  function show() {
    document.getElementById("wantok-ai-panel").classList.add("open");
    document.getElementById("wantok-ai-input").focus();
  }
  function hide() {
    document.getElementById("wantok-ai-panel").classList.remove("open");
  }
  async function refreshLiveData() {
    if (!db) return;
    try {
      var results = await Promise.all([
        db.from("posts").select("title,body,kind,province,district,created_at").eq("status","approved").order("created_at",{ascending:false}).limit(6),
        db.from("jobs").select("title,employer,location,province,job_type,closing_date,description").eq("status","approved").order("created_at",{ascending:false}).limit(6),
        db.from("businesses").select("name,category,location,province,town,description,phone,website,products,services").eq("status","approved").order("created_at",{ascending:false}).limit(6),
        db.from("products").select("name,description,price_kina,unit,in_stock,category_id").eq("in_stock",true).limit(8),
        db.from("talents").select("title,category,description,owner_name").eq("status","approved").order("created_at",{ascending:false}).limit(6),
        db.from("gov_services").select("name,description,url,category").order("sort",{ascending:true}).limit(30),
        db.from("gov_locations").select("id,name,location_type,parent_id,region,official_source_url,verification_status,source_name,source_url").order("name",{ascending:true}).limit(500), db.from("gov_district_contacts").select("location_id,department,office_name,contact_name,phone,email,website_url,source_url,verification_status,notes").order("department",{ascending:true}).limit(250)
      ]);
      liveData.posts = results[0].error ? [] : (results[0].data || []);
      liveData.jobs = results[1].error ? [] : (results[1].data || []);
      liveData.businesses = results[2].error ? [] : (results[2].data || []);
      liveData.products = results[3].error ? [] : (results[3].data || []);
      liveData.talents = results[4].error ? [] : (results[4].data || []);
      liveData.services = results[5].error ? [] : (results[5].data || []);
      liveData.locations = results[6].error ? [] : (results[6].data || []); liveData.districtContacts = results[7].error ? [] : (results[7].data || []);
      liveData.ready = results.some(function(r){ return !r.error; });
      var status = document.getElementById("wantok-ai-live-status");
      if (status) status.textContent = liveData.ready ? "● Connected to approved public WANTOK PNG records" : "● Live records unavailable · basic help remains available";
    } catch (_) {
      var status = document.getElementById("wantok-ai-live-status");
      if (status) status.textContent = "● Live records unavailable · basic help remains available";
    }
  }
  function publicList(items, mapper, emptyText, limit) {
    if (!items || !items.length) return emptyText;
    return items.slice(0, limit || 5).map(function(item,i){ return (i+1)+". "+mapper(item); }).join("\n");
  }
  function liveContextReply(q, tpi, prefix) {
    if (!liveData.ready) return "";
    if (/how many|count|available now|currently listed|what is listed|olsem hamas|hamas i stap/.test(q)) {
      return tpi
        ? "Mi kisim sampela public data tasol: inap long 6 community post, 6 approved wok listing, 6 approved bisnis, 8 in-stock prodak, 6 approved talent entry na 20 government service link. Dispela em sampela rekod tasol, i no total kaun."
        : "I loaded public samples from WANTOK PNG: up to 6 recent approved community posts, 6 approved job listings, 6 approved businesses, 8 in-stock products, 6 approved talent entries and 20 government-service links. These are capped samples, not total database counts.";
    }
    if (/market|sell|selling|buy|buyer|product|bilum|price|listing/.test(q) || mode === "market") {
      var p = publicList(liveData.products,function(x){return x.name+(x.price_kina!=null?" — K"+x.price_kina+(x.unit?" / "+x.unit:""):"")+(x.description?" — "+x.description:"");},"No in-stock product records are currently visible in the public Market data.");
      var b = publicList(liveData.businesses,function(x){return x.name+(x.category?" ("+x.category+")":"")+(x.location||x.town?" — "+(x.location||x.town):"");},"No approved business records are currently visible.");
      return tpi ? prefix+"Mi sekim public Market data bilong Wantok PNG. Ol prodak: \n"+p+"\nOl bisnis: \n"+b : prefix+"I checked the live public Market records. In-stock products:\n"+p+"\nApproved businesses:\n"+b;
    }
    if (/job|work|employment|vacancy|cv|resume|employer|career/.test(q) || mode === "jobs") {
      var j=publicList(liveData.jobs,function(x){return x.title+(x.employer?" — "+x.employer:"")+(x.location||x.province?" — "+(x.location||x.province):"")+(x.closing_date?" — closes "+x.closing_date:"");},"There are currently no approved job listings visible in the connected public records. You can still check the Work section again later.");
      return tpi ? prefix+"Ol approved wok listing mi painim: \n"+j : prefix+"Approved job listings currently visible in the connected WANTOK PNG database:\n"+j;
    }
    if (/business|register|registration|shop|store|company|customer|delivery|small business/.test(q) || mode === "business") {
      var bs=publicList(liveData.businesses,function(x){return x.name+(x.category?" — "+x.category:"")+(x.location||x.town?" — "+(x.location||x.town):"")+(x.phone?" — "+x.phone:"");},"There are currently no approved public business listings visible to this assistant. Business owners can submit their details through Business Connect; listings may require approval.");
      return tpi ? prefix+"Ol bisnis i stap long public list: \n"+bs : prefix+"Approved businesses currently visible in Business Connect:\n"+bs;
    }
    if (/talent|artist|music|sing|dance|creative|skill/.test(q) || mode === "talent") {
      var ts=publicList(liveData.talents,function(x){return x.title+(x.category?" — "+x.category:"")+(x.owner_name?" — "+x.owner_name:"");},"There are currently no approved talent entries visible in the public records.");
      return tpi ? prefix+"Ol talent entry: \n"+ts : prefix+"Approved Talent entries currently visible:\n"+ts;
    }
    if (/government|department|minister|district|dda|dsip|psip|treasury|service|office|passport|police|hospital|education|school|tax|irc|revenue|health|finance|bank|election|vote|court|justice|ombudsman|planning|fisheries|mining|petroleum|visa|passport|foreign affairs|consular|public service|statistics|census|digital portal/.test(q) || mode === "government") {
      var words = q.split(/[^a-z0-9]+/).filter(function(w){ return w.length > 3; });
      var matches = liveData.services.filter(function(x) {
        var hay = (x.name+" "+(x.category||"")+" "+(x.description||"")).toLowerCase();
        return words.some(function(w){ return hay.indexOf(w) >= 0; });
      });
      var selected = matches.length ? matches : liveData.services;
      var requestedDistrict = liveData.locations.some(function(item){ return item.location_type === "district" && locationNameMatch(item); });
      var gs=publicList(selected,function(x){return x.name+(x.category?" — "+x.category:"")+(x.url?" — "+x.url:"")+(x.description?" — "+x.description:"");},"No government-service links are currently stored in the public directory.", requestedDistrict ? 24 : 5);
      function locationNameMatch(item) {
        var name = item.name.toLowerCase().replace(/\s+(province|district|llg)$/,"").trim();
        if (name.length < 3) return false;
        return q.indexOf(name) >= 0 || (name.indexOf("northern (oro)") >= 0 && /\boro\b/.test(q)) || (name.indexOf("chimbu (simbu)") >= 0 && /\bsimbu\b/.test(q));
      }
      var locationHits = liveData.locations.filter(locationNameMatch);
      var locationLines = [];
      function locationStatusTag(item) {
        if (!item) return "";
        if (item.verification_status === "needs_review") return " [NEEDS REVIEW — confirm with administration]";
        if (item.verification_status === "source_listed") return " [source-listed]";
        if (item.verification_status === "verified_contact") return " [verified]";
        return "";
      }
      locationHits.slice(0,12).forEach(function(hit){
        var parent = liveData.locations.find(function(x){ return x.id === hit.parent_id; });
        var grand = parent ? liveData.locations.find(function(x){ return x.id === parent.parent_id; }) : null;
        var path = [grand && grand.name, parent && parent.name, hit.name].filter(Boolean).join(" > ");
        locationLines.push(path + locationStatusTag(hit));
        if (hit.location_type === "province") {
          liveData.locations.filter(function(x){ return x.parent_id === hit.id && x.location_type === "district"; }).forEach(function(d){
            locationLines.push("  District: "+d.name + locationStatusTag(d));
            liveData.locations.filter(function(x){ return x.parent_id === d.id && x.location_type === "llg"; }).forEach(function(l){ locationLines.push("    LLG: "+l.name + locationStatusTag(l)); });
          });
        } else if (hit.location_type === "district") {
          liveData.locations.filter(function(x){ return x.parent_id === hit.id && x.location_type === "llg"; }).forEach(function(l){ locationLines.push("  LLG: "+l.name + locationStatusTag(l)); });
        }
      });
      var portalLines = [];
      locationHits.forEach(function(hit){
        var parent = liveData.locations.find(function(x){ return x.id === hit.parent_id; });
        var portal = hit.official_source_url || (parent && parent.official_source_url);
        if (portal && (hit.location_type === "district" || hit.location_type === "province")) {
          portalLines.push((hit.location_type === "district" ? hit.name+" district administration / provincial contact directory" : hit.name+" provincial administration")+" — "+portal);
        }
      });
      var contactLines = [];
      var requestedDepartment = "";
      if (/\b(health|hospital|clinic|medical|pha)\b/.test(q)) requestedDepartment = "health";
      else if (/\b(finance|treasury)\b/.test(q)) requestedDepartment = "finance";
      else if (/\b(education|school|teacher|teachers)\b/.test(q)) requestedDepartment = "education";
      else if (/\b(police|constabulary|law enforcement|rpngc)\b/.test(q)) requestedDepartment = "police";
      else if (/\b(agriculture|livestock|farming|farmer|primary industries)\b/.test(q)) requestedDepartment = "agriculture";
      else if (/\b(works|road|roads|highway|highways|transport|bridge|bridges)\b/.test(q)) requestedDepartment = "works";
      else if (/\b(land|lands|physical planning|land title|survey)\b/.test(q)) requestedDepartment = "lands";
      else if (/\b(community development|religion|youth|welfare|social services)\b/.test(q)) requestedDepartment = "community development";
      var contactLocations = [];
      function addContactLocation(item) {
        if (item && !contactLocations.some(function(existing){ return existing.id === item.id; })) contactLocations.push(item);
      }
      locationHits.forEach(function(hit){
        if (hit.location_type === "province") addContactLocation(hit);
        else if (hit.location_type === "district") {
          addContactLocation(hit);
          addContactLocation(liveData.locations.find(function(x){ return x.id === hit.parent_id && x.location_type === "province"; }));
        } else if (hit.location_type === "llg") {
          var district = liveData.locations.find(function(x){ return x.id === hit.parent_id && x.location_type === "district"; });
          addContactLocation(district);
          if (district) addContactLocation(liveData.locations.find(function(x){ return x.id === district.parent_id && x.location_type === "province"; }));
        }
      });
      var hasLocalPhoneOrEmail = false;
      var hasDistrictReferral = false;
      if (requestedDepartment) {
        hasLocalPhoneOrEmail = contactLocations.some(function(location){
          return liveData.districtContacts.some(function(contact){
            return contact.location_id === location.id &&
              (contact.department || "").toLowerCase() === requestedDepartment &&
              (contact.phone || contact.email);
          });
        });
        hasDistrictReferral = contactLocations.some(function(location){
          return liveData.districtContacts.some(function(contact){
            return contact.location_id === location.id &&
              (contact.department || "").toLowerCase() === "district administration referral" &&
              (contact.phone || contact.email);
          });
        });
        if (!hasLocalPhoneOrEmail && !hasDistrictReferral) {
          var nationalOffice = liveData.locations.find(function(item){
            return item.location_type === "province" && item.name === "National Capital District";
          });
          addContactLocation(nationalOffice);
        }
      }
      contactLocations.forEach(function(hit){
        liveData.districtContacts.filter(function(contact){
          return contact.location_id === hit.id && (!requestedDepartment || (contact.department || "").toLowerCase() === requestedDepartment || (!hasLocalPhoneOrEmail && (contact.department || "").toLowerCase() === "district administration referral"));
        }).forEach(function(contact){
          var label = hit.name + (hit.location_type === "province" ? (hit.name === "National Capital District" ? " (national headquarters)" : " (provincial contact)") : " (district contact)");
          var line = label + " — " + (contact.department || "Government") + " " + (contact.office_name || "office");
          if (contact.contact_name) line += "; contact: " + contact.contact_name;
          if (contact.phone) line += "; phone: " + contact.phone;
          if (contact.email) line += "; email: " + contact.email;
          if (contact.website_url) line += "; website: " + contact.website_url;
          if (contact.source_url) line += "; source: " + contact.source_url;
          if (contact.verification_status) line += "; status: " + contact.verification_status;
          if (contact.notes) line += "; note: " + contact.notes;
          contactLines.push(line);
        });
      });
      var contactText = contactLines.length ? "\\n\\nPublished department contacts (check verification status and confirm details before visiting):\\n" + contactLines.join("\\n") : "";
      var districtGuidance = requestedDistrict
        ? "\\n\\nDistrict service connections: the department links below are official national department portals available to people across PNG. They are not proof of a staffed office in this district. Use the provincial/district administration contact directory above to confirm the nearest local office, officer and current contact details."
        : "";
      var portalText = portalLines.length ? "\\n\\nOfficial provincial / district contact directory:\\n"+portalLines.join("\\n") : "";
      var locationText = locationLines.length ? "\\n\\nProvincial / district / LLG directory:\\n"+locationLines.join("\\n")+"\\nDirectory sources include Open Admin Data (CC BY 4.0), PNG Electoral Commission and Provincial/District Administration publications. Entries marked NEEDS REVIEW must be confirmed with the relevant administration."+portalText+contactText+districtGuidance : portalText+contactText+districtGuidance;
      var guidance = matches.length ? "I matched the closest department/service to your question." : "Here are the main official links currently in the directory. Tell me the department or service name to narrow the list.";
      return tpi ? prefix+"Mi painim ol official gavman link long WANTOK PNG. Openim link bilong stretpela opis, lukim Services, Forms o Contact, na bihainim ol step bilong ol. Kisim ol pepa ol i askim long en na sekim fee na deadline stret long opis. WANTOK PNG i no save approve aplikesen.\\n"+gs+locationText : prefix+guidance+" Open the official link, look for Services, Forms or Contact, follow the department's instructions, prepare the documents it requests, and confirm current fees and deadlines directly with that office. WANTOK PNG cannot approve government applications.\\n"+gs+locationText;
    }
    if (/story|reel|live|video|photo|post|comment|message|inbox/.test(q) || mode === "community" || mode === "media") {
      var ps=publicList(liveData.posts,function(x){return x.title+(x.province?" — "+x.province:"")+(x.body?" — "+x.body.slice(0,130):"");},"No approved community posts are currently visible in the public feed records.");
      return tpi ? prefix+"Ol public community post: \n"+ps : prefix+"Recent approved public community posts:\n"+ps;
    }
    return "";
  }
  function localReply(question) {
    var q = question.toLowerCase();
    var tpi = language === "tpi";
    var prefix = tpi ? "Gutpela askim, wantok! " : "Good question. ";
    var liveAnswer = liveContextReply(q, tpi, prefix);
    if (liveAnswer) return liveAnswer;
    if (/^(hi|hello|hey|halo|greetings|moning|apinun)/.test(q)) {
      return tpi ? "Halo wantok! Mi WANTOK AI bilong helpim yu. Yu laik save long Market, wok, bisnis, Talent, Wantok community o Government Connect?" : "Hello, wantok! I’m WANTOK AI, the built-in helper for this platform. What would you like help with—Market, jobs, business, Talent, community or Government Connect?";
    }
    if (/tok pisin|translate|translation|meaning/.test(q)) {
      return tpi ? "Mi inap helpim long ol isi Tok Pisin toktok na mining bilong ol tok. Salim tok o sentens yu laik mi eksplenim." : "I can help explain simple Tok Pisin phrases and meanings. Send me the word or sentence you want explained.";
    }
    if (/market|sell|selling|buy|buyer|product|bilum|price|listing/.test(q) || mode === "market") {
      return tpi ? prefix + "Long Market, yu ken putim ol samting yu salim, piksa, prais long Kina, ples na kontak. Raitim klia nem bilong prodak, prais, hamas i stap na hau long kisim. Skelim gut man o meri yu no save long en taim yu stretim peimen." : prefix + "In Market, create a clear listing with product photos, price in kina, location, quantity and contact details. Keep the price and delivery terms clear, and take care when arranging payment with people you don’t know.";
    }
    if (/job|work|employment|vacancy|cv|resume|employer|career/.test(q) || mode === "jobs") {
      return tpi ? prefix + "Long Work, painim wok o putim wok i stap. Lukim gut nem bilong kampani, ples bilong wok, mak bilong save na deadline. No ken baim mani long kisim wok sapos yu no sekim gut." : prefix + "In Work & Jobs, browse vacancies or post a job with the employer name, location, requirements, pay details where available and closing date. Verify the employer and never pay an unverified recruiter to get a job.";
    }
    if (/business|register|registration|shop|store|company|customer|delivery|small business/.test(q) || mode === "business") {
      return tpi ? prefix + "Long Business Connect, bisnis i ken soim nem, wanem samting em i salim, ples, fon na delivery sapos em i gat. Putim stretpela infomesen na toktok wantaim ol kastoma long WANTOK PNG." : prefix + "Business Connect helps local businesses present their name, products or services, location, contact details and delivery options. Keep business information accurate and respond clearly to customers. Check the relevant PNG authorities for formal registration requirements.";
    }
    if (/talent|artist|music|sing|dance|creative|skill|video/.test(q) || mode === "talent") {
      return tpi ? prefix + "Long Talent, soim save bilong yu long piksa, vidio o stori. Tokaut long wanem kain wok yu save mekim na hau ol manmeri inap kontakim yu. Yu mas kisim tok orait bipo yu postim piksa bilong narapela." : prefix + "Use Talent to showcase your skills through photos, videos or a short description. Explain what you do and how people can contact you. Get permission before posting someone else’s image or work.";
    }
    if (/government|department|minister|district|dda|dsip|psip|treasury|service|office|passport|police|hospital/.test(q) || mode === "government") {
      return tpi ? prefix + "Government Connect i helpim yu long painim ol link na infomesen bilong gavman. Sekim ol official website o go stret long ofis bilong gavman bilong kisim laspela infomesen. WANTOK PNG i no gavman ofis na em i no inap garanti long approval bilong aplikesen." : prefix + "Government Connect is intended to help people find government departments, services and official information. Confirm current requirements, fees and application status directly with the responsible government office or its official website. WANTOK PNG is not a government authority and cannot approve applications.";
    }
    if (/safe|scam|fraud|report|harass|abuse|threat|emergency|danger/.test(q) || mode === "safety") {
      return tpi ? prefix + "Sapos yu stap long bikpela danger, go long ples i gat seifti na ringim polis o lokal emergency help kwiktaim. No ken salim password, PIN o bank code long wanpela man. Holim evidens bilong scam na ripotim long stretpela autoriti." : prefix + "If someone is in immediate danger, move to a safer place and contact local police or emergency services. Never share passwords, PINs or banking codes. Keep evidence of suspected scams and report them to the relevant platform or authority.";
    }
    if (/story|reel|live|video|photo|post|comment|message|inbox/.test(q) || mode === "community" || mode === "media") {
      return tpi ? prefix + "Long Wantok community, yu ken serim stori, piksa, vidio na toktok wantaim ol narapela. Bipo yu post, sekim gut infomesen na kisim tok orait bilong ol manmeri i stap long piksa. Yusim report sapos yu lukim samting i no stret." : prefix + "In Wantok community, you can share posts, photos, videos and comments, and connect with other members. Check information before sharing, get consent from people shown in photos, and use reporting tools for harmful content.";
    }
    if (/how|help|what can|features|use wantok|wantok png/.test(q) || mode === "general") {
      return tpi ? "WANTOK PNG em i digital ples bilong PNG long bungim ol manmeri, bisnis na gavman sevis. Yu ken yusim Market bilong salim na baim, Work bilong painim wok, Business Connect, Talent, Wantok community na Government Connect. Makim wanpela topik antap na askim mi." : "WANTOK PNG brings people, businesses and government-service information together. You can explore Market, Work & Jobs, Business Connect, Talent, Wantok community and Government Connect. Choose a topic above and ask a specific question.";
    }
    return tpi ? "Mi stap long Free Mode nau. Mi inap helpim long ol isi askim bilong WANTOK PNG, tasol mi no gat live AI search o live data yet. Traim askim long Market, Work, Business, Talent, Community, Safety o Government Connect." : "I’m running in Free Mode. I can help with basic WANTOK PNG guidance, but I don’t have live AI search or live platform data enabled. Try asking about Market, Work, Business, Talent, Community, Safety or Government Connect.";
  }
  async function send() {
    var input = document.getElementById("wantok-ai-input");
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    history.push({ role: "user", content: text });
    appendMessage("user", text);
    setBusy(true);
    var wait = el("div", { className: "wantok-ai-msg assistant", id: "wantok-ai-wait" }, "WANTOK AI is preparing a free-mode answer...");
    document.getElementById("wantok-ai-messages").appendChild(wait);
    try {
      await refreshLiveData();
      var answer = localReply(text);
      var waitNode = document.getElementById("wantok-ai-wait");
      if (waitNode) waitNode.remove();
      history.push({ role: "assistant", content: answer });
      appendMessage("assistant", answer);
    } catch (error) {
      var pending = document.getElementById("wantok-ai-wait");
      if (pending) pending.remove();
      appendMessage("assistant", "Sorry wantok, something went wrong. Please try again.");
    } finally {
      setBusy(false);
      input.focus();
    }
  }
  function mount() {
    if (!document.body || document.getElementById("wantok-ai-launch")) return;
    addStyles();
    var launch = el("button", { id: "wantok-ai-launch", type: "button" }, "✨ WANTOK AI");
    launch.addEventListener("click", show);
    document.body.appendChild(launch);

    var panel = el("section", { id: "wantok-ai-panel", "aria-label": "WANTOK AI assistant" });
    var head = el("div", { id: "wantok-ai-head" });
    var heading = el("div");
    heading.appendChild(el("strong", {}, "🇵🇬 WANTOK AI"));
    heading.appendChild(el("div", {}, "Your PNG digital helper · Free Mode"));
    head.appendChild(heading);
    var close = el("button", { id: "wantok-ai-close", type: "button", "aria-label": "Close" }, "×");
    close.addEventListener("click", hide);
    head.appendChild(close);
    panel.appendChild(head);

    var liveStatus = el("div", { id: "wantok-ai-live-status" }, "● Connecting to public WANTOK PNG records...");
    liveStatus.style.cssText = "font-size:11px;color:#64748b;padding:6px 12px;background:#fff";
    panel.appendChild(liveStatus);

    var controls = el("div", { id: "wantok-ai-controls" });
    var modeSelect = el("select", { "aria-label": "AI topic" });
    [
      ["general", "All WANTOK PNG"],
      ["community", "Community"],
      ["business", "Business Connect"],
      ["market", "Market"],
      ["jobs", "Work & Jobs"],
      ["talent", "Talent"],
      ["government", "Government Connect"],
      ["safety", "Community Safety"],
      ["media", "Media Studio"]
    ].forEach(function (item) {
      var option = el("option", { value: item[0] }, item[1]);
      modeSelect.appendChild(option);
    });
    modeSelect.value = mode;
    modeSelect.addEventListener("change", function () { mode = modeSelect.value; });
    var langSelect = el("select", { "aria-label": "Reply language" });
    [["tpi", "Tok Pisin"], ["en", "English"], ["auto", "Auto language"]].forEach(function (item) {
      langSelect.appendChild(el("option", { value: item[0] }, item[1]));
    });
    langSelect.value = language;
    langSelect.addEventListener("change", function () { language = langSelect.value; });
    controls.appendChild(modeSelect);
    controls.appendChild(langSelect);
    panel.appendChild(controls);

    var messages = el("div", { id: "wantok-ai-messages" });
    messages.appendChild(el("div", { className: "wantok-ai-msg assistant" }, "Halo wantok! Mi WANTOK AI long Free Mode. Mi inap givim ol isi tok help long Market, Work, Business, Talent, Wantok na Government Connect. Askim mi long Tok Pisin o English."));
    panel.appendChild(messages);

    var compose = el("div", { id: "wantok-ai-compose" });
    var input = el("textarea", { id: "wantok-ai-input", rows: "1", placeholder: "Ask WANTOK AI..." });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
    });
    var sendButton = el("button", { id: "wantok-ai-send", type: "button" }, "Send");
    sendButton.addEventListener("click", send);
    compose.appendChild(input);
    compose.appendChild(sendButton);
    panel.appendChild(compose);
    panel.appendChild(el("div", { id: "wantok-ai-foot" }, "Free built-in guidance, not live AI. Confirm official information with the responsible office."));
    document.body.appendChild(panel);
    if (window.supabase && window.supabase.createClient) {
      db = window.supabase.createClient(SB_URL, SB_KEY);
      refreshLiveData();
    } else {
      var status = document.getElementById("wantok-ai-live-status");
      if (status) status.textContent = "● Public database connection unavailable · basic help remains available";
    }

  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();