-- Create the site_map_order table to store sitemap options and their order
create table if not exists site_map_order (
  id serial primary key,
  page_key text unique not null,
  page_label text not null,
  order_index integer not null default 0
);

-- Example: Insert default sitemap options (run only once, or use upsert)
insert into site_map_order (page_key, page_label, order_index) values
  ('home', 'Home', 0),
  ('about', 'About', 1),
  ('services', 'Services', 2),
  ('portfolio', 'Portfolio', 3),
  ('blog', 'Blog', 4),
  ('contact', 'Contact', 5)
on conflict (page_key) do nothing;

-- To update the order from your app, use:
-- update site_map_order set order_index = {new_index} where page_key = '{page_key}';

-- To fetch the sitemap in order:
-- select * from site_map_order order by order_index asc;
