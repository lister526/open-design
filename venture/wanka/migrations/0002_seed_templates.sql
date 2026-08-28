-- Seed templates: the "current supply" that beats cold-start (Cold Start Problem principle).
-- Platform-authored (author_id NULL). recipe is a JSON structure the generator fills.

INSERT OR IGNORE INTO templates (id,author_id,title,kind,category,recipe,preview,price_cents,uses,wins,status,created_at) VALUES
('tpl_hook_ugc','','痛点开场·UGC 口播','video_script','home','{"structure":["hook_pain","agitate","product_reveal","proof","cta"],"tone":"relatable","len_s":30}','0-3s 用痛点抓人的口播脚本',0,1240,86,'published',1),
('tpl_before_after','','前后对比·转化型','video_script','beauty','{"structure":["before","after","how","offer","cta"],"tone":"punchy","len_s":20}','前后对比强转化短视频',0,980,71,'published',1),
('tpl_3reasons','','3 个理由带货','ad_copy','3c','{"structure":["headline","reason1","reason2","reason3","cta"],"tone":"confident"}','三点理由式带货文案',0,1520,110,'published',1),
('tpl_scarcity','','限时稀缺·促单','ad_copy','apparel','{"structure":["headline","scarcity","benefit","cta"],"tone":"urgent"}','限时/稀缺促单文案',0,760,54,'published',1),
('tpl_hero_image','','主图·卖点堆叠','image_brief','3c','{"layout":"hero","elements":["product_center","3_selling_badges","price_tag","brand"],"style":"clean_ecom"}','电商主图·卖点徽章版',0,2010,140,'published',1),
('tpl_lifestyle','','场景生活方式图','image_brief','home','{"layout":"lifestyle","elements":["product_in_scene","mood","subtle_logo"],"style":"warm_natural"}','生活场景种草图',0,1330,88,'published',1),
('tpl_listing_amz','','Amazon 五点描述','listing','3c','{"structure":["title","bullet5","a_plus_ideas","keywords"],"marketplace":"amazon"}','亚马逊标题+五点+关键词',0,1440,97,'published',1),
('tpl_listing_tt','','TikTok Shop 短描述','listing','beauty','{"structure":["title","short_desc","hashtags","cta"],"marketplace":"tiktok_shop"}','TikTok Shop 描述+标签',0,890,60,'published',1),
('tpl_testimonial','','好评式口播','video_script','beauty','{"structure":["as_customer","problem_solved","specifics","recommend"],"tone":"sincere","len_s":25}','伪好评式真诚口播',0,670,44,'published',1),
('tpl_unbox','','开箱·期待感','video_script','3c','{"structure":["tease","unbox","first_impression","key_feature","cta"],"tone":"excited","len_s":30}','开箱期待感脚本',0,1120,79,'published',1);
