---
  title: REST API reference
  description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
  displayed_sidebar: cmsSidebar
  tags:
  - API
  - Content API
  - documentId
  - Documents
  - plural API ID
  - REST API
  - singular API ID
  ---

  # REST API reference

  The REST API allows accessing the [content-types](/cms/backend-customization/models) through API endpoints. Strapi automatically creates [API endpoints](#endpoints) when a content-type is created. [API parameters](/cms/api/rest/parameters) can be used when querying API endpoints to refine the results.

  This section of the documentation is for the REST API reference for content-types. We also have [guides](/cms/api/rest/guides/intro) available for specific use cases.

  :::prerequisites
  All content types are private by default and need to be either made public or queries need to be authenticated with the proper permissions. See the [Quick Start Guide](/cms/quick-start#step-4-set-roles--permissions), the user guide for the [Users & Permissions feature](/cms/features/users-permissions#roles), and [API tokens configuration documentation](/cms/features/api-tokens) for more details.
  :::

  :::note
  By default, the REST API responses only include top-level fields and does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](/cms/api/rest/populate-select) to populate specific fields. Ensure that the find permission is given to the field(s) for the relation(s) you populate.
  :::

  :::strapi Strapi Client
  The [Strapi Client](/cms/api/client) library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content.
  :::

  ## Endpoints

  For each Content-Type, the following endpoints are automatically generated:

  <details>

  <summary>Plural API ID vs. Singular API ID:</summary>

  In the following tables:

  - `:singularApiId` refers to the value of the "API ID (Singular)" field of the content-type,
  - and `:pluralApiId` refers to the value of the "API ID (Plural)" field of the content-type.

  These values are defined when creating a content-type in the Content-Type Builder, and can be found while editing a content-type in the admin panel (see [User Guide](/cms/features/content-type-builder#creating-content-types)). For instance, by default, for an "Article" content-type:

  - `:singularApiId` will be `article`
  - `:pluralApiId` will be `articles`

  <ThemedImage
  alt="Screenshot of the Content-Type Builder to retrieve singular and plural API IDs"
  sources={{
    light: '/img/assets/rest-api/plural-api-id.png',
    dark: '/img/assets/rest-api/plural-api-id_DARK.png'
  }}
  />

  </details>

  <Tabs groupId="collection-single">

  <TabItem value="collection" label="Collection type">

  | Method   | URL                             | Description                           |
  | -------- | ------------------------------- | ------------------------------------- |
  | `GET`    | `/api/:pluralApiId`             | [Get a list of document](#get-all) |
  | `POST`   | `/api/:pluralApiId`             | [Create a document](#create)   |
  | `GET`    | `/api/:pluralApiId/:documentId` | [Get a document](#get)         |
  | `PUT`    | `/api/:pluralApiId/:documentId` | [Update a document](#update)   |
  | `DELETE` | `/api/:pluralApiId/:documentId` | [Delete a document](#delete)   |

  </TabItem>

  <TabItem value="single" label="Single type">

  | Method   | URL                   | Description                                |
  | -------- | --------------------- | ------------------------------------------ |
  | `GET`    | `/api/:singularApiId` | [Get a document](#get)              |
  | `PUT`    | `/api/:singularApiId` | [Update/Create a document](#update) |
  | `DELETE` | `/api/:singularApiId` | [Delete a document](#delete)        |

  </TabItem>

  </Tabs>

  <details>

  <summary>Real-world examples of endpoints:</summary>

  The following endpoint examples are taken from the <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> example application.

  <Tabs groupId="collection-single">

  <TabItem value="collection" label="Collection type">

  `Restaurant` **Content type**

  | Method | URL                      | Description               |
  | ------ | ------------------------ | ------------------------- |
  | GET    | `/api/restaurants`       | Get a list of restaurants |
  | POST   | `/api/restaurants`       | Create a restaurant       |
  | GET    | `/api/restaurants/:documentId`   | Get a specific restaurant |
  | DELETE | `/api/restaurants/:documentId`   | Delete a restaurant       |
  | PUT    | `/api/restaurants/:documentId`   | Update a restaurant       |

  </TabItem>

  <TabItem value="single" label="Single type">

  `Homepage` **Content type**

  | Method | URL             | Description                        |
  | ------ | --------------- | ---------------------------------- |
  | GET    | `/api/homepage` | Get the homepage content           |
  | PUT    | `/api/homepage` | Update/create the homepage content |
  | DELETE | `/api/homepage` | Delete the homepage content        |

  </TabItem>
  </Tabs>
  </details>

  :::strapi Upload API
  The Upload package (which powers the [Media Library feature](/cms/features/media-library)) has a specific API accessible through its [`/api/upload` endpoints](/cms/api/rest/upload).
  :::

  :::note
  [Components](/cms/backend-customization/models#components-json) don't have API endpoints.
  :::

  ## Requests

  :::strapi Strapi 5 vs. Strapi v4
  Strapi 5's Content API includes 2 major differences with Strapi v4:

  - The response format has been flattened, which means attributes are no longer nested in a `data.attributes` object and are directly accessible at the first level of the `data` object (e.g., a content-type's "title" attribute is accessed with `data.title`).
  - Strapi 5 now uses **documents** <DocumentDefinition/> and documents are accessed by their `documentId` (see [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/use-document-id) for details)
  :::

  Requests return a response as an object which usually includes the following keys:

  - `data`: the response data itself, which could be:
    - a single document, as an object with the following keys:
      - `id` (integer)
      - `documentId` (string), which is the unique identifier to use when querying a given document,
      - the attributes (each attribute's type depends on the attribute, see [models attributes](/cms/backend-customization/models#model-attributes) documentation for details)
      - `meta` (object)
    - a list of documents, as an array of objects
    - a custom response

  - `meta` (object): information about pagination, publication state, available locales, etc.

  - `error` (object, _optional_): information about any [error](/cms/error-handling) thrown by the request

  :::note
  Some plugins (including Users & Permissions and Upload) may not follow this response format.
  :::

  ### Get documents {#get-all}

  Returns documents matching the query filters (see [API parameters](/cms/api/rest/parameters) documentation).

  :::tip Tip: Strapi 5 vs. Strapi 4
  In Strapi 5 the response format has been flattened, and attributes are directly accessible from the `data` object instead of being nested in `data.attributes`.

  You can pass an optional header while you're migrating to Strapi 5 (see the [related breaking change](/cms/migration/v4-to-v5/breaking-changes/new-response-format)).
  :::

  <ApiCall>

  <Request>

  `GET http://localhost:1337/api/restaurants`

  </Request>

  <Response>

  ```json
  {
    "data": [
      {
        "id": 2,
        "documentId": "hgv1vny5cebq2l3czil1rpb3",
        "Name": "BMK Paris Bamako",
        "Description": null,
        "createdAt": "2024-03-06T13:42:05.098Z",
        "updatedAt": "2024-03-06T13:42:05.098Z",
        "publishedAt": "2024-03-06T13:42:05.103Z",
        "locale": "en"
      },
      {
        "id": 4,
        "documentId": "znrlzntu9ei5onjvwfaalu2v",
        "Name": "Biscotte Restaurant",
        "Description": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
              }
            ]
          }
        ],
        "createdAt": "2024-03-06T13:43:30.172Z",
        "updatedAt": "2024-03-06T13:43:30.172Z",
        "publishedAt": "2024-03-06T13:43:30.175Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 2
      }
    }
  }
  ```

  </Response>

  </ApiCall>

  ### Get a document {#get}

  Returns a document by `documentId`.

  :::strapi Strapi 5 vs. Strapi v4
  In Strapi 5, a specific document is reached by its `documentId`.
  :::

  <ApiCall>

  <Request title="Example request">

  `GET http://localhost:1337/api/restaurants/j964065dnjrdr4u89weh79xl`

  </Request>

  <Response title="Example response">

  ```json
  {
    "data": {
      "id": 6,
      "documentId": "znrlzntu9ei5onjvwfaalu2v",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine bassics, such as 4 Formaggi or Calzone, and our original creations such as Do Luigi or Nduja."
            }
          ]
        }
      ],
      "createdAt": "2024-02-27T10:19:04.953Z",
      "updatedAt": "2024-03-05T15:52:05.591Z",
      "publishedAt": "2024-03-05T15:52:05.600Z",
      "locale": "en"
    },
    "meta": {}
  }

  ```

  </Response>

  </ApiCall>

  ### Create a document {#create}

  Creates a document and returns its value.

  If the [Internationalization (i18n) plugin](/cms/features/internationalization) is installed, it's possible to use POST requests to the REST API to [create localized documents](/cms/api/rest/locale#rest-delete).

  :::note
  While creating a document, you can define its relations and their order (see [Managing relations through the REST API](/cms/api/rest/relations.md) for more details).
  :::

  <ApiCall>

  <Request title="Example request">

  `POST http://localhost:1337/api/restaurants`

  ```json
  {
    "data": {
      "Name": "Restaurant D",
      "Description": [ // uses the "Rich text (blocks)" field type
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ]
    }
  }
  ```

  </Request>

  <Response title="Example response">

  ```json
  {
    "data": {
      "documentId": "bw64dnu97i56nq85106yt4du",
      "Name": "Restaurant D",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      "createdAt": "2024-03-05T16:44:47.689Z",
      "updatedAt": "2024-03-05T16:44:47.689Z",
      "publishedAt": "2024-03-05T16:44:47.687Z",
      "locale": "en"
    },
    "meta": {}
  }
  ```

  </Response>

  </ApiCall>

  ### Update a document {#update}

  Partially updates a document by `id` and returns its value.

  Send a `null` value to clear fields.

  :::note NOTES
  * Even with the [Internationalization (i18n) plugin](/cms/features/internationalization) installed, it's currently not possible to [update the locale of a document](/cms/api/rest/locale#rest-update).
  * While updating a document, you can define its relations and their order (see [Managing relations through the REST API](/cms/api/rest/relations) for more details).
  :::

  <ApiCall>

  <Request title="Example request">

  `PUT http://localhost:1337/api/restaurants/hgv1vny5cebq2l3czil1rpb3`

  ```json
  {
    "data": {
      "Name": "BMK Paris Bamako", // we didn't change this field but still need to include it
      "Description": [ // uses the "Rich text (blocks)" field type
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ]
    }
  }
  ```

  </Request>

  <Response title="Example response">

  ```json
  {
    "data": {
      "id": 9,
      "documentId": "hgv1vny5cebq2l3czil1rpb3",
      "Name": "BMK Paris Bamako",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      "createdAt": "2024-03-06T13:42:05.098Z",
      "updatedAt": "2024-03-06T14:16:56.883Z",
      "publishedAt": "2024-03-06T14:16:56.895Z",
      "locale": "en"
    },
    "meta": {}
  }
  ```

  </Response>

  </ApiCall>

  ### Delete a document {#delete}

  Deletes a document.

  `DELETE` requests only send a 204 HTTP status code on success and do not return any data in the response body.

  <ApiCall>

  <Request title="Example request">

  `DELETE http://localhost:1337/api/restaurants/bw64dnu97i56nq85106yt4du`

  </Request>

  </ApiCall>





---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
sidebar_label: Populate & Select
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- Combining operators
- find
- populate
- REST API
- select
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: Population & Field Selection

The [REST API](/cms/api/rest) by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](#population) to populate specific fields and the [`select` parameter](#field-selection) to return only specific fields with the query results.

:::tip
<QsIntroFull />
:::

:::callout 🏗 Work-in-progress
Strapi v4 docs very recently included a more extensive description of how to use the `populate` parameter, including an [extensive API reference](https://docs.strapi.io/cms/api/rest/populate-select#population) and [additional guides](https://docs.strapi.io/cms/api/rest/guides/intro). These v4 pages are currently being ported and adapted to Strapi 5 docs so that examples reflect the new data response format.

In the meantime, you can trust the content of the present page as accurate as it already reflects the new Strapi 5, flattened response format (see [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/new-response-format) and [REST API introduction](/cms/api/rest#requests) for details); the present page is just not as complete as its v4 equivalent yet.
:::

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default, only the following [types of fields](/cms/backend-customization/models#model-attributes) are returned:

- string types: string, text, richtext, enumeration, email, password, and uid,
- date types: date, time, datetime, and timestamp,
- number types: integer, biginteger, float, and decimal,
- generic types: boolean, array, and JSON.

| Use case              | Example parameter syntax              |
|-----------------------|---------------------------------------|
| Select a single field | `fields=name`                         |
| Select multiple fields| `fields[0]=name&fields[1]=description`|

:::note
Field selection does not work on relational, media, component, or dynamic zone fields. To populate these fields, use the [`populate` parameter](#population).
:::

<ApiCall noSideBySide>
<Request title="Example request: Return only name and description fields">

`GET /api/restaurants?fields[0]=name&fields[1]=description`

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    fields: ['name', 'description'],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/users?${query}`);
```

</details>
</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 4,
      "Name": "Pizzeria Arrivederci",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Specialized in pizza, we invite you to rediscover our classics, such as 4 Formaggi or Calzone, and our original creations such as Do Luigi or Nduja."
            }
          ]
        }
      ],
      "documentId": "lr5wju2og49bf820kj9kz8c3"
    },
    // …
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 4
    }
  }
}
```

</Response>
</ApiCall>

## Population

The REST API by default does not populate any type of fields, so it will not populate relations, media fields, components, or dynamic zones unless you pass a `populate` parameter to populate various field types.

The `populate` parameter can be used alone or [in combination with with multiple operators](#combining-population-with-other-operators) to have much more control over the population.

:::caution
The `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated (see [User Guide](/cms/features/users-permissions#editing-a-role) for additional information on how to enable `find` permissions for content-types).
:::

:::note
It's currently not possible to return just an array of ids with a request.
:::

:::strapi Populating guides

The [REST API guides](/cms/api/rest/guides/intro) section includes more detailed information about various possible use cases for the populate parameter:

- The [Understanding populate](/cms/api/rest/guides/understanding-populate) guide explains in details how populate works, with diagrams, comparisons, and real-world examples.
- The [How to populate creator fields](/cms/api/rest/guides/populate-creator-fields) guide provides step-by-step instructions on how to add `createdBy` and `updatedBy` fields to your queries responses.

:::

The following table sums up possible populate use cases and their associated parameter syntaxes, and links to sections of the Understanding populate guide which includes more detailed explanations:

| Use case  | Example parameter syntax | Detailed explanations to read |
|-----------| ---------------|-----------------------|
| Populate everything, 1 level deep, including media fields, relations, components, and dynamic zones | `populate=*`| [Populate all relations and fields, 1 level deep](/cms/api/rest/guides/understanding-populate#populate-all-relations-and-fields-1-level-deep) |
| Populate one relation,<br/>1 level deep | `populate=a-relation-name`| [Populate 1 level deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate several relations,<br/>1 level deep | `populate[0]=relation-name&populate[1]=another-relation-name&populate[2]=yet-another-relation-name`| [Populate 1 level deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate some relations, several levels deep | `populate[root-relation-name][populate][0]=nested-relation-name`| [Populate several levels deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-several-levels-deep-for-specific-relations) |
| Populate a component | `populate[0]=component-name`| [Populate components](/cms/api/rest/guides/understanding-populate#populate-components) |
| Populate a component and one of its nested components | `populate[0]=component-name&populate[1]=component-name.nested-component-name`| [Populate components](/cms/api/rest/guides/understanding-populate#populate-components) |
| Populate a dynamic zone (only its first-level elements) | `populate[0]=dynamic-zone-name`| [Populate dynamic zones](/cms/api/rest/guides/understanding-populate#populate-dynamic-zones) |
| Populate a dynamic zone and its nested elements and relations, using a precisely defined, detailed population strategy | `populate[dynamic-zone-name][on][component-category.component-name][populate][relation-name][populate][0]=field-name`| [Populate dynamic zones](/cms/api/rest/guides/understanding-populate#populate-dynamic-zones) |

:::tip
The easiest way to build complex queries with multiple-level population is to use our [interactive query builder](/cms/api/rest/interactive-query-builder) tool.
:::

### Combining Population with other operators

By utilizing the `populate` operator it is possible to combine other operators such as [field selection](/cms/api/rest/populate-select#field-selection), [filters](/cms/api/rest/filters), and [sort](/cms/api/rest/sort-pagination) in the population queries.

:::caution
The population and pagination operators cannot be combined.
:::

#### Populate with field selection

`fields` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?fields[0]=title&fields[1]=slug&populate[headerImage][fields][0]=name&populate[headerImage][fields][1]=url`

</Request>

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    fields: ['title', 'slug'],
    populate: {
      headerImage: {
        fields: ['name', 'url'],
      },
    },
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      "slug": "test-article",
      "headerImage": {
        "id": 1,
        "documentId": "cf07g1dbusqr8mzmlbqvlegx",
        "name": "17520.jpg",
        "url": "/uploads/17520_73c601c014.jpg"
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

</Response>
</ApiCall>


#### Populate with filtering

`filters` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[categories][sort][0]=name%3Aasc&populate[categories][filters][name][$eq]=Cars`

</Request>

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    populate: {
      categories: {
        sort: ['name:asc'],
        filters: {
          name: {
            $eq: 'Cars',
          },
        },
      },
    },
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "a1b2c3d4e5d6f7g8h9i0jkl",
      "title": "Test Article",
      // ...
      "categories": {
        "data": [
          {
            "id": 2,
            "documentId": "jKd8djla9ndalk98hflj3",
            "name": "Cars"
            // ...
          }
        ]
        }
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

</Response>
</ApiCall>



---
title: Interactive Query Builder
description: Use an interactive tool that leverages the querystring library to build your query URL
displayed_sidebar: cmsSidebar
sidebar_label: Interactive Query Builder
tags:
- Content API
- interactive query builder
- REST API
- qs library
---

# Build your query URL with Strapi's interactive tool

A wide range of parameters can be used and combined to query your content with the [REST API](/cms/api/rest), which can result in long and complex query URLs.

Strapi's codebase uses <ExternalLink to="https://github.com/ljharb/qs" text="the `qs` library"/> to parse and stringify nested JavaScript objects. It's recommended to use `qs` directly to generate complex query URLs instead of creating them manually.

You can use the following interactive query builder tool to generate query URLs automatically:

1. Replace the values in the _Endpoint_ and _Endpoint Query Parameters_ fields with content that fits your needs.
2. Click the **Copy to clipboard** button to copy the automatically generated _Query String URL_ which is updated as you type.

:::info Parameters usage
Please refer to the [REST API parameters table](/cms/api/rest/parameters) and read the corresponding parameters documentation pages to better understand parameters usage.
:::

<br />

<InteractiveQueryBuilder
  endpoint="/api/books"
  code={`
{
  sort: ['title:asc'],
  filters: {
    title: {
      $eq: 'hello',
    },
  },
  populate: {
    author: {
      fields: ['firstName', 'lastName']
    }
  },
  fields: ['title'],
  pagination: {
    pageSize: 10,
    page: 1,
  },
  status: 'published',
  locale: ['en'],
}
  `}
/>

<br />

<br />

:::note
The default endpoint path is prefixed with `/api/` and should be kept as-is unless you configured a different API prefix using [the `rest.prefix` API configuration option](/cms/configurations/api).<br/> For instance, to query the `books` collection type using the default API prefix, type `/api/books` in the _Endpoint_ field.
:::

:::caution Disclaimer
The `qs` library and the interactive query builder provided on this page:
- might not detect all syntax errors,
- are not aware of the parameters and values available in a Strapi project,
- and do not provide autocomplete features.

Currently, these tools are only provided to transform the JavaScript object in an inline query string URL. Using the generated query URL does not guarantee that proper results will get returned with your API.
:::


---
title: Sort and Pagination
description: Use Strapi's REST API to sort or paginate your data.
sidebar_label: Sort & Pagination
sidebarDepth: 3
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- interactive query builder
- pagination
- pagination by page
- pagination by offset
- REST API
- sort
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: Sort & Pagination

Entries that are returned by queries to the [REST API](/cms/api/rest) can be sorted and paginated.

:::tip

<QsIntroFull />

:::

## Sorting

Queries can accept a `sort` parameter that allows sorting on one or multiple fields with the following syntaxes:

- `GET /api/:pluralApiId?sort=value` to sort on 1 field
- `GET /api/:pluralApiId?sort[0]=value1&sort[1]=value2` to sort on multiple fields (e.g. on 2 fields)

The sorting order can be defined with:

- `:asc` for ascending order (default order, can be omitted)
- or `:desc` for descending order.


### Example: Sort using 2 fields

You can sort by multiple fields by passing fields in a `sort` array.

<br />

<ApiCall>
<Request title="Example request: Sort using 2 fields">

`GET /api/restaurants?sort[0]=Description&sort[1]=Name`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['Description', 'Name'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 9,
      "documentId": "hgv1vny5cebq2l3czil1rpb3",
      "Name": "BMK Paris Bamako",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      // …
    },
    {
      "id": 8,
      "documentId": "flzc8qrarj19ee0luix8knxn",
      "Name": "Restaurant D",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      // …
    },
   // …
  ],
  "meta": {
    // …
  }
}
```

</Response>
</ApiCall>

### Example: Sort using 2 fields and set the order

Using the `sort` parameter and defining `:asc` or  `:desc` on sorted fields, you can get results sorted in a particular order.

<br />

<ApiCall>
<Request title="Example request: Sort using 2 fields and set the order">

`GET /api/restaurants?sort[0]=Description:asc&sort[1]=Name:desc`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['Description:asc', 'Name:desc'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 8,
      "documentId": "flzc8qrarj19ee0luix8knxn",
      "Name": "Restaurant D",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      // …
    },
    {
      "id": 9,
      "documentId": "hgv1vny5cebq2l3czil1rpb3",
      "Name": "BMK Paris Bamako",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "A very short description goes here."
            }
          ]
        }
      ],
      // …
    },
    // …
  ],
  "meta": {
    // …
  }
}
```

</Response>

</ApiCall>

## Pagination

Queries can accept `pagination` parameters. Results can be paginated:

- either by [page](#pagination-by-page) (i.e., specifying a page number and the number of entries per page)
- or by [offset](#pagination-by-offset) (i.e., specifying how many entries to skip and to return)

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

### Pagination by page

To paginate results by page, use the following parameters:

| Parameter               | Type    | Description                                                               | Default |
| ----------------------- | ------- | ------------------------------------------------------------------------- | ------- |
| `pagination[page]`      | Integer | Page number                                                               | 1       |
| `pagination[pageSize]`  | Integer | Page size                                                                 | 25      |
| `pagination[withCount]` | Boolean | Adds the total numbers of entries and the number of pages to the response | True    |

<ApiCall>
<Request title="Example request: Return only 10 entries on page 1">

`GET /api/articles?pagination[page]=1&pagination[pageSize]=10`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    page: 1,
    pageSize: 10,
  },
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    // ...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 48
    }
  }
}
```

</Response>
</ApiCall>

### Pagination by offset

To paginate results by offset, use the following parameters:

| Parameter               | Type    | Description                                                    | Default |
| ----------------------- | ------- | -------------------------------------------------------------- | ------- |
| `pagination[start]`     | Integer | Start value (i.e. first entry to return)                      | 0       |
| `pagination[limit]`     | Integer | Number of entries to return                                    | 25      |
| `pagination[withCount]` | Boolean | Toggles displaying the total number of entries to the response | `true`  |

:::tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/api.js`](/cms/configurations/api) file with the `api.rest.defaultLimit` and `api.rest.maxLimit` keys.
:::

<ApiCall>
<Request title="Example request: Return only the first 10 entries using offset">

`GET /api/articles?pagination[start]=0&pagination[limit]=10`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    start: 0,
    limit: 10,
  },
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    // ...
  ],
  "meta": {
    "pagination": {
      "start": 0,
      "limit": 10,
      "total": 42
    }
  }
}
```

</Response>
</ApiCall>
