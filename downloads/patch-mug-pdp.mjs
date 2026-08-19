import fs from "node:fs";

const p = "apps/shopify-theme/sections/main-product.liquid";
let s = fs.readFileSync(p, "utf8");
const markers = [
  '  {% else %}\r\n    <div class="page-width product"',
  '  {% else %}\n    <div class="page-width product"',
];
let i = -1;
for (const m of markers) {
  i = s.indexOf(m);
  if (i >= 0) break;
}
if (i < 0) {
  console.error("marker not found");
  process.exit(1);
}
const j = s.lastIndexOf("{% schema %}");
const replacement = `  {% else %}
    {%- liquid
      assign is_mug = false
      assign is_bottle = false
      if handle_down contains 'mug'
        assign is_mug = true
      endif
      if handle_down contains 'bottle'
        assign is_bottle = true
      endif
      assign gift_crumb_label = 'Home & gifts'
      assign gift_crumb_url = '/collections/home-gifts'
      if is_mug
        assign gift_crumb_label = 'Mugs'
        assign gift_crumb_url = '/collections/mugs'
      elsif is_bottle
        assign gift_crumb_label = 'Water bottles'
        assign gift_crumb_url = '/collections/water-bottles'
      endif
    -%}
    <div class="page-width product" id="Product-{{ section.id }}">
      <div class="product__media">
        <div class="product__media-frame" data-product-media>
          {% if current_variant.featured_media %}
            {% assign media = current_variant.featured_media %}
          {% else %}
            {% assign media = product.featured_media %}
          {% endif %}
          {% if media %}
            <img
              class="product__image"
              src="{{ media | image_url: width: 1400 }}"
              alt="{{ media.alt | default: product.title | escape }}"
              width="{{ media.width }}"
              height="{{ media.height }}"
              data-product-image
            >
          {% else %}
            {% render 'mock-image', product: product, class: 'product__image', width: 900 %}
          {% endif %}
        </div>
      </div>
      <div class="product__info">
        <nav class="pb-canvas__crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/collections/home-gifts">Home &amp; gifts</a>
          <span>/</span>
          <a href="{{ gift_crumb_url }}">{{ gift_crumb_label }}</a>
          <span>/</span>
          <span>{{ product.title }}</span>
        </nav>
        <h1 class="product__title">{{ product.title }}</h1>
        <p class="product__price" data-product-price>{{ current_variant.price | money }}</p>
        {% if product.description != blank %}
          <div class="product__description rte">{{ product.description }}</div>
        {% endif %}
        {% form 'product', product, id: 'product-form', class: 'product-form' %}
          <input type="hidden" name="id" value="{{ current_variant.id }}" data-variant-id>
          {% unless product.has_only_default_variant %}
            {% if color_option_index != nil and is_mug %}
              <div class="pb-canvas__step product-form__color">
                <p class="pb-canvas__label">Inside colour</p>
                <div class="pb-canvas__frames" role="radiogroup" aria-label="Inside colour" data-gift-color>
                  {% for value in product.options_with_values[color_option_index].values %}
                    {% assign color_down = value | downcase %}
                    {% assign color_key = value | handleize %}
                    {% if color_down contains 'yellow' %}
                      {% assign color_key = 'yellow' %}
                    {% elsif color_down contains 'pink' %}
                      {% assign color_key = 'pink' %}
                    {% elsif color_down contains 'green' %}
                      {% assign color_key = 'green' %}
                    {% elsif color_down contains 'red' %}
                      {% assign color_key = 'red' %}
                    {% elsif color_down contains 'black' %}
                      {% assign color_key = 'black' %}
                    {% elsif color_down contains 'blue' %}
                      {% assign color_key = 'blue' %}
                    {% endif %}
                    <button
                      type="button"
                      class="pb-frame{% if product.options_with_values[color_option_index].selected_value == value %} is-selected{% endif %}"
                      data-gift-color-value="{{ value | escape }}"
                      aria-pressed="{% if product.options_with_values[color_option_index].selected_value == value %}true{% else %}false{% endif %}"
                    >
                      <span class="pb-frame__swatch pb-frame__swatch--{{ color_key }}" aria-hidden="true"></span>
                      <span class="pb-frame__label">{{ value | remove: 'Ceramic ' }}</span>
                    </button>
                  {% endfor %}
                </div>
                <select name="options[{{ product.options_with_values[color_option_index].name | escape }}]" class="visually-hidden" data-gift-color-select aria-hidden="true" tabindex="-1">
                  {% for value in product.options_with_values[color_option_index].values %}
                    <option value="{{ value | escape }}" {% if product.options_with_values[color_option_index].selected_value == value %}selected{% endif %}>{{ value }}</option>
                  {% endfor %}
                </select>
              </div>
            {% else %}
              <div class="product-form__variants">
                {% for option in product.options_with_values %}
                  <label class="field-label" for="Option-{{ section.id }}-{{ forloop.index0 }}">{{ option.name }}</label>
                  <select id="Option-{{ section.id }}-{{ forloop.index0 }}" name="options[{{ option.name | escape }}]" class="field-select">
                    {% for value in option.values %}
                      <option value="{{ value | escape }}" {% if option.selected_value == value %}selected{% endif %}>{{ value }}</option>
                    {% endfor %}
                  </select>
                {% endfor %}
              </div>
            {% endif %}
          {% endunless %}
          <button type="submit" name="add" class="button button--primary btn-addtocart" data-add-to-cart {% if current_variant.available == false %}disabled{% endif %}>
            {% if current_variant.available %}Add to cart{% else %}Sold out{% endif %}
          </button>
        {% endform %}
      </div>
    </div>
    {% if color_option_index != nil and is_mug %}
      <script type="application/json" data-gift-variants>
        [
          {%- for variant in product.variants -%}
            {
              "id": {{ variant.id | json }},
              "available": {{ variant.available | json }},
              "priceFormatted": {{ variant.price | money | json }},
              "options": {{ variant.options | json }},
              "featuredImage": {% if variant.featured_media %}{{ variant.featured_media | image_url: width: 1100 | json }}{% elsif product.featured_media %}{{ product.featured_media | image_url: width: 1100 | json }}{% else %}null{% endif %}
            }{% unless forloop.last %},{% endunless %}
          {%- endfor -%}
        ]
      </script>
      <script>
        (function () {
          var root = document.getElementById('Product-{{ section.id }}');
          if (!root) return;
          var mapEl = document.querySelector('[data-gift-variants]');
          if (!mapEl) return;
          var variants = JSON.parse(mapEl.textContent);
          var select = root.querySelector('[data-gift-color-select]');
          var idInput = root.querySelector('[data-variant-id]');
          var priceEl = root.querySelector('[data-product-price]');
          var imageEl = root.querySelector('[data-product-image]') || root.querySelector('.product__image');
          var addBtn = root.querySelector('[data-add-to-cart]');
          var btns = root.querySelectorAll('[data-gift-color-value]');
          function apply(value) {
            if (select) select.value = value;
            var v = variants.find(function (x) { return x.options[0] === value; }) || variants[0];
            if (!v) return;
            if (idInput) idInput.value = v.id;
            if (priceEl) priceEl.textContent = v.priceFormatted;
            if (imageEl && v.featuredImage) { imageEl.src = v.featuredImage; imageEl.srcset = ''; }
            if (addBtn) {
              addBtn.disabled = !v.available;
              addBtn.textContent = v.available ? 'Add to cart' : 'Sold out';
            }
            btns.forEach(function (b) {
              var on = b.getAttribute('data-gift-color-value') === value;
              b.classList.toggle('is-selected', on);
              b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
          }
          btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
              apply(btn.getAttribute('data-gift-color-value'));
            });
          });
        })();
      </script>
    {% endif %}
  {% endif %}
</section>

{% if is_variant_picker %}
  {% render 'variant-picker-script', section_id: section.id %}
{% endif %}

`;
fs.writeFileSync(p, s.slice(0, i) + replacement + s.slice(j));
console.log("patched ok");
