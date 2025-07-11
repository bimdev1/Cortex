import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Multi-Network Orchestration',
    Svg: require('@site/static/img/undraw_server_cluster.svg').default,
    description: (
      <>
        Submit jobs across multiple DePIN networks (Akash, Render, Golem, Bittensor, io.net) 
        through a single interface. Cortex handles the complexity of multi-network coordination.
      </>
    ),
  },
  {
    title: 'Cost Optimization',
    Svg: require('@site/static/img/undraw_savings.svg').default,
    description: (
      <>
        Save 15-30x compared to traditional cloud providers. Intelligent routing 
        finds the best price and performance across decentralized networks.
      </>
    ),
  },
  {
    title: 'Real-Time Monitoring',
    Svg: require('@site/static/img/undraw_real_time_analytics.svg').default,
    description: (
      <>
        Track job progress, costs, and network status in real-time. Built-in 
        dashboards provide complete visibility into your decentralized compute operations.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
